import axios from 'axios';
import { Patient, MedicalNote } from '../types';

const API_URL = '/.netlify/functions/api';

const handleApiError = (error: any) => {
  console.error('API Error:', error.response?.data || error.message);
  throw error;
};

export const api = {
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get(`${API_URL}/patients`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const response = await axios.post(`${API_URL}/patients`, patient);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const response = await axios.put(`${API_URL}/patients/${id}`, updates);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getMedicalNotes(patientId: string): Promise<MedicalNote[]> {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/notes`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async addMedicalNote(note: Omit<MedicalNote, 'id'>): Promise<MedicalNote> {
    try {
      const response = await axios.post(`${API_URL}/notes`, note);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getMedicalNotesByDate(patientId: string, date: string): Promise<MedicalNote[]> {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/notes`, { params: { date } });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async extractPatientData(startDate: string, endDate: string): Promise<(Patient & { notes: MedicalNote[] })[]> {
    try {
      const response = await axios.get(`${API_URL}/extract`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  async dischargePatient(patientId: string, dischargeNotes: string): Promise<Patient> {
    try {
      const response = await axios.post(`${API_URL}/patients/${patientId}/discharge`, { dischargeNotes });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getDailyReport(date: string): Promise<{ [specialty: string]: { active: Patient[], discharged: Patient[] } }> {
    try {
      const response = await axios.get(`${API_URL}/reports/daily`, { params: { date } });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return {};
    }
  }
};