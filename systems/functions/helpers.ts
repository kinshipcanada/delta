export async function callKinshipAPI(url: string, data?: {}) {
    try {
      const response = await fetch(url, {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data || {}), 
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }