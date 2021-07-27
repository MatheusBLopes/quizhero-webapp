import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quizhero.herokuapp.com/',
})

export default api;