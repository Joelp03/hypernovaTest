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


export const fetchPromisesIncomplete = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/analytics/promesas-incumplidas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incomplete promises:', error);
      throw error;
    }
}

export const fetchHoursEffectiveness = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/analytics/mejores-horarios`);
      return response.data;
    } catch (error) {
      console.error('Error fetching best hours effectiveness:', error);
      throw error;
    }
}

export const fetchAgentsDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/agentes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent details:', error);
      throw error;
    }
}

export const fetchGraphData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/analytics/graph`);
      return response.data;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
}