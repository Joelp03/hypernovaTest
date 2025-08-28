import axios from 'axios';

const BASE_URL  = "http://localhost:3000/api"
export const fetchClientTimeline = async (clientId) => {
  try {
    const response = await axios.get(`${BASE_URL}/clientes/${clientId}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client timeline:', error);
    throw error;
  }
};


export const fetchClients = async () => {
   try {
     const response = await axios.get(`${BASE_URL}/clientes`);
     return response.data;
   } catch (error) {
     console.error('Error fetching clients:', error);
     throw error;
   }
}
