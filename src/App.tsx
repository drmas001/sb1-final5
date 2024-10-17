import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import AdmitPatient from './components/AdmitPatient';
import SpecialtyPage from './components/SpecialtyPage';
import PatientDetails from './components/PatientDetails';
import DischargePatient from './components/DischargePatient';
import DischargeList from './components/DischargeList';
import DailyReportComponent from './components/DailyReport';
import ExtractPatientData from './components/ExtractPatientData';
import { Patient, MedicalNote, Specialty } from './types';
import { api } from './services/api';

const specialties: Specialty[] = [
  'General Internal Medicine',
  'Hematology',
  'Rheumatology',
  'Pulmonology',
  'Infectious Diseases',
  'Neurology',
  'Endocrinology',
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = async () => {
    try {
      const fetchedPatients = await api.getPatients();
      setPatients(Array.isArray(fetchedPatients) ? fetchedPatients : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = async (newPatient: Omit<Patient, 'id'>) => {
    try {
      const addedPatient = await api.addPatient(newPatient);
      setPatients(prevPatients => [...prevPatients, addedPatient]);
      return addedPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const handleDischargePatient = async (patientId: string, dischargeNotes: string) => {
    try {
      const updatedPatient = await api.updatePatient(patientId, { 
        status: 'Discharged', 
        dischargeDate: new Date().toISOString() 
      });
      await api.addMedicalNote({
        patientId,
        date: new Date().toISOString(),
        note: `Discharge notes: ${dischargeNotes}`,
        user: 'System',
      });
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === patientId ? updatedPatient : p)
      );
    } catch (error) {
      console.error('Error discharging patient:', error);
      throw error;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16">
          <Navigation />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admit" element={<AdmitPatient onAdmit={handleAddPatient} />} />
              <Route path="/specialties" element={
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">Specialties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specialties.map(specialty => (
                      <SpecialtyPage
                        key={specialty}
                        specialty={specialty}
                        patients={patients}
                      />
                    ))}
                  </div>
                </div>
              } />
              <Route path="/patient/:id" element={<PatientDetails patients={patients} onAddNote={api.addMedicalNote} />} />
              <Route path="/discharge" element={<DischargeList patients={patients} onRequestDischarge={handleDischargePatient} />} />
              <Route path="/discharge/:id" element={<DischargePatient patients={patients} onDischarge={handleDischargePatient} />} />
              <Route path="/reports" element={<DailyReportComponent patients={patients} />} />
              <Route path="/extract" element={<ExtractPatientData patients={patients} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;