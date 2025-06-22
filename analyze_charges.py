import csv

# Read donation_rows charge IDs
donation_charges = set()
with open('donation_rows (18).csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['stripe_charge_id']:
            donation_charges.add(row['stripe_charge_id'])

# Read unified_payments charge IDs
unified_charges = set()
with open('unified_payments.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        charge_id = row['stripe_charge_id']  # Updated to correct column name
        if charge_id:
            unified_charges.add(charge_id)

# Find charges that exist in unified_payments but not in donation_rows
missing_charges = unified_charges - donation_charges

print("Charges in unified_payments.csv that don't exist in donation_rows (18).csv:")
for charge in sorted(missing_charges):
    print(charge)
print(f"\nTotal missing charges: {len(missing_charges)}") 