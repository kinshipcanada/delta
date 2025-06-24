import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button, ButtonStyle } from '@components/primitives';
import { supabase } from '@lib/utils/helpers';
import { useAuth } from '@components/prebuilts/Authentication';
import { useRouter } from 'next/router';

interface DonationEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (donationData: any, causesData: any[]) => void;
  transaction: {
    id: string;
    date: string;
    amount: number;
    name: string;
    description: string;
  };
}

const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const extractNameFromETransfer = (name: string): string => {
  // Extract name after "e-Transfer - Autodeposit"
  const match = name.match(/e-Transfer - Autodeposit\s+(.+)/i);
  if (match && match[1]) {
    // Take first two words as name
    const nameParts = match[1].split(' ').slice(0, 2);
    return formatName(nameParts.join(' '));
  }
  return '';
};

export default function DonationEntryModal({ isOpen, onClose, onSubmit, transaction }: DonationEntryModalProps) {
  const router = useRouter();
  const { donor, authContextLoading } = useAuth();
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('CA');
  const [postalCode, setPostalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [causes, setCauses] = useState([{
    id: crypto.randomUUID(),
    cause: '',
    region: 'ANYWHERE',
    amountDonatedCents: 0
  }]);

  const [totalAmountCents, setTotalAmountCents] = useState(0);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (donor && !authContextLoading) {
      // Pre-fill form with donor data if available
      setDonorName(donor.donor_first_name + ' ' + donor.donor_last_name);
      setEmail(donor.donor_email);
      setAddress(donor.donor_address_line_address);
      setCity(donor.donor_address_city);
      setState(donor.donor_address_state);
      setCountry(donor.donor_address_country);
      setPostalCode(donor.donor_address_postal_code);
    } else if (transaction.name) {
      const formattedName = extractNameFromETransfer(transaction.name);
      if (formattedName) {
        setDonorName(formattedName);
        lookupDonor(formattedName);
      }
    }
  }, [donor, authContextLoading, transaction.name]);

  useEffect(() => {
    // Set the total amount when form is submitted, using absolute value
    const totalAmount = Math.abs(transaction.amount * 100);
    setTotalAmountCents(totalAmount);
    setCauses(prevCauses => [{
      ...prevCauses[0],
      amountDonatedCents: totalAmount
    }]);
  }, [transaction.amount]);

  const lookupDonor = async (name: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/donors/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.donor) {
          // Populate form with existing donor data
          setEmail(data.donor.email || '');
          setAddress(data.donor.line_address || '');
          setCity(data.donor.city || '');
          setState(data.donor.state || '');
          setCountry(data.donor.country || 'CA');
          setPostalCode(data.donor.postal_code || '');
        }
      }
    } catch (error) {
      console.error('Error looking up donor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTotalAmount = (causes: any[]): boolean => {
    const total = causes.reduce((sum, cause) => sum + cause.amountDonatedCents, 0);
    if (total > totalAmountCents) {
      setAmountError(`Total amount cannot exceed ${(totalAmountCents/100).toFixed(2)} CAD`);
      return false;
    }
    if (total < totalAmountCents) {
      setAmountError(`Total amount must equal ${(totalAmountCents/100).toFixed(2)} CAD`);
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleCauseChange = (index: number, field: string, value: string) => {
    const newCauses = [...causes];
    if (field === 'amountDonatedCents') {
      const newAmount = parseFloat(value) * 100;
      // Don't update if it would make the total exceed the limit
      const otherCausesTotal = causes.reduce((sum, cause, i) => 
        i === index ? sum : sum + cause.amountDonatedCents, 0);
      if (otherCausesTotal + newAmount > totalAmountCents) {
        setAmountError(`Total amount cannot exceed ${(totalAmountCents/100).toFixed(2)} CAD`);
        return;
      }
      newCauses[index] = { ...newCauses[index], [field]: newAmount };
    } else if (field === 'cause') {
      // Handle automatic region setting based on cause
      let autoRegion: string | null = null;

      switch(value.toLowerCase()) {
        case 'where most needed':
          autoRegion = 'ANYWHERE';
          break;
        case 'orphans':
          // If current region isn't India or Africa, default to India
          if (!['INDIA', 'AFRICA'].includes(newCauses[index].region)) {
            autoRegion = 'INDIA';
          }
          break;
        case 'medical aid':
        case 'housing':
        case 'widows':
        case 'education':
        case 'poverty relief':
        case 'fidya':
        case 'quran':
          autoRegion = 'ANYWHERE';
          break;
        case 'vision kinship':
          autoRegion = 'INDIA';
          break;
        case 'sehme imam':
          autoRegion = 'IRAQ';
          break;
        case 'sehme sadat':
          autoRegion = 'INDIA';
          break;
      }

      newCauses[index] = { 
        ...newCauses[index], 
        [field]: value,
        region: autoRegion || newCauses[index].region
      };
    } else if (field === 'region') {
      // Only allow region change if it's not a cause with fixed region
      const cause = newCauses[index].cause.toLowerCase();
      const isOrphans = cause === 'orphans';
      
      if (isOrphans && ['INDIA', 'AFRICA'].includes(value)) {
        // Allow region change for orphans if it's India or Africa
        newCauses[index] = { ...newCauses[index], [field]: value };
      } else if (!['where most needed', 'vision kinship', 'sehme imam', 'sehme sadat'].includes(cause)) {
        // Allow region change for causes that don't have fixed regions
        newCauses[index] = { ...newCauses[index], [field]: value };
      }
    }
    
    setCauses(newCauses);
    validateTotalAmount(newCauses);
  };

  const addCause = () => {
    try {
      // Calculate remaining amount
      const usedAmount = causes.reduce((sum, cause) => sum + cause.amountDonatedCents, 0);
      const remainingAmount = totalAmountCents - usedAmount;
      
      if (remainingAmount <= 0) {
        setAmountError('Cannot add more causes - total amount has been allocated');
        return;
      }

      // Add new cause with default values
      const newCause = {
        id: crypto.randomUUID(),
        cause: '',
        region: 'ANYWHERE',
        amountDonatedCents: 0
      };

      setCauses(prevCauses => [...prevCauses, newCause]);
      setAmountError(''); // Clear any existing errors
    } catch (error) {
      console.error('Error adding cause:', error);
      setAmountError('Failed to add cause. Please try again.');
    }
  };

  const removeCause = (index: number) => {
    setCauses(causes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate total amount before submitting
      if (!validateTotalAmount(causes)) {
        return;
      }

      // Check both Plaid and Auth sessions in parallel for efficiency
      const [plaidResponse, authResponse] = await Promise.all([
        fetch('/api/plaid/check-env', {
          credentials: 'include'
        }),
        supabase.auth.getSession()
      ]);

      const plaidData = await plaidResponse.json();
      const { data: { session }, error: sessionError } = authResponse;

      // Check both sessions before proceeding
      if (!plaidData.success || !plaidData.hasValidSession) {
        console.error('No valid Plaid session found');
        // Use window.location for a full page reload
        window.location.href = '/admin/login';
        return;
      }

      if (sessionError || !session) {
        console.error('No valid auth session found:', sessionError);
        // Use window.location for a full page reload
        window.location.href = '/admin/login';
        return;
      }

      const donationData = {
        id: crypto.randomUUID(),
        donor_name: donorName,
        email,
        line_address: address,
        city,
        state,
        country,
        postal_code: postalCode,
        amount_charged_cents: totalAmountCents,
        date: new Date(transaction.date),
        status: 'PROCESSING',
        et_ref_num: transaction.id,
        fee_charged_by_processor: 0,
        fees_covered_by_donor: 0,
        stripe_customer_id: null,
        stripe_transfer_id: null,
        stripe_charge_id: null,
        version: 2
      };

      await onSubmit(donationData, causes);
      onClose();
    } catch (error) {
      console.error('Error submitting donation:', error);
      if (error instanceof Error && 
          (error.message.includes('session') || 
           error.message.includes('auth') || 
           error.message.includes('unauthorized'))) {
        // Use window.location for a full page reload
        window.location.href = '/admin/login';
        return;
      }
      alert(`Failed to submit donation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl p-6 overflow-y-auto max-h-[90vh]">
          <Dialog.Title className="text-xl font-bold mb-4">Enter Donation Details</Dialog.Title>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Looking up donor information...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Causes</h3>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={(e) => {
                      e.preventDefault();
                      addCause();
                    }}
                  >
                    Add Cause
                  </button>
                </div>

                {amountError && (
                  <div className="text-red-600 text-sm">{amountError}</div>
                )}

                {causes.map((cause, index) => (
                  <div key={cause.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Cause {index + 1}</h4>
                      {causes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCause(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cause Type</label>
                        <select
                          required
                          value={cause.cause}
                          onChange={(e) => handleCauseChange(index, 'cause', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select a cause</option>
                          <option value="orphans">Orphans</option>
                          <option value="medical aid">Medical Aid</option>
                          <option value="housing">Housing</option>
                          <option value="widows">Widows</option>
                          <option value="education">Education</option>
                          <option value="poverty relief">Poverty Relief</option>
                          <option value="where most needed">Where Most Needed</option>
                          <option value="vision kinship">Vision Kinship</option>
                          <option value="fidya">Fidya</option>
                          <option value="quran">Quran</option>
                          <option value="sehme sadat">Sehme Sadat</option>
                          <option value="sehme imam">Sehme Imam</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Region</label>
                        <select
                          required
                          value={cause.region}
                          onChange={(e) => handleCauseChange(index, 'region', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          disabled={cause.cause === 'where most needed' || 
                                    cause.cause === 'vision kinship' || 
                                    cause.cause === 'sehme imam' || 
                                    cause.cause === 'sehme sadat' ||
                                    ['medical aid', 'housing', 'widows', 'education', 'poverty relief', 'fidya', 'quran'].includes(cause.cause)}
                        >
                          {cause.cause === 'orphans' ? (
                            <>
                              <option value="INDIA">India</option>
                              <option value="AFRICA">Africa</option>
                            </>
                          ) : (
                            <>
                              <option value="ANYWHERE">Anywhere</option>
                              <option value="INDIA">India</option>
                              <option value="IRAQ">Iraq</option>
                              <option value="AFRICA">Africa</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Amount (CAD) - Remaining: ${((totalAmountCents - causes.reduce((sum, c) => sum + c.amountDonatedCents, 0))/100).toFixed(2)}
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Enter amount"
                          value={cause.amountDonatedCents === 0 ? '' : (cause.amountDonatedCents / 100)}
                          onChange={(e) => handleCauseChange(index, 'amountDonatedCents', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  text="Cancel"
                  style={ButtonStyle.Secondary}
                  onClick={onClose}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Donation
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 