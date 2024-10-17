import React, { useState } from 'react';
import { Patient, Specialty } from '../types';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface AdmitPatientProps {
  onAdmit: (patient: Omit<Patient, 'id'>) => Promise<Patient>;
}

const AdmitPatient: React.FC<AdmitPatientProps> = ({ onAdmit }) => {
  const [name, setName] = useState('');
  const [mrn, setMRN] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [diagnosis, setDiagnosis] = useState('');
  const [specialty, setSpecialty] = useState<Specialty>('General Internal Medicine');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionTime, setAdmissionTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    const newPatient: Omit<Patient, 'id'> = {
      name,
      mrn,
      age: parseInt(age),
      gender,
      diagnosis,
      admissionDate: `${admissionDate}T${admissionTime}:00`,
      status: 'Active',
      specialty,
      assignedDoctor: assignedDoctor || undefined,
    };
    
    try {
      console.log('Submitting patient:', newPatient);
      const addedPatient = await onAdmit(newPatient);
      console.log('Patient admitted successfully:', addedPatient);
      navigate('/specialties');
    } catch (error: any) {
      console.error('Error admitting patient:', error);
      setError(`An error occurred while admitting the patient: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <UserPlus className="mr-2" />
        Admit New Patient
      </h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Patient Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mrn">
            MRN (Medical Record Number)
          </label>
          <input
            type="text"
            id="mrn"
            value={mrn}
            onChange={(e) => setMRN(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="diagnosis">
            Diagnosis
          </label>
          <input
            type="text"
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialty">
            Specialty
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as Specialty)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="General Internal Medicine">General Internal Medicine</option>
            <option value="Hematology">Hematology</option>
            <option value="Rheumatology">Rheumatology</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Infectious Diseases">Infectious Diseases</option>
            <option value="Neurology">Neurology</option>
            <option value="Endocrinology">Endocrinology</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignedDoctor">
            Assigned Doctor (Optional)
          </label>
          <input
            type="text"
            id="assignedDoctor"
            value={assignedDoctor}
            onChange={(e) => setAssignedDoctor(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admissionDate">
            Admission Date
          </label>
          <input
            type="date"
            id="admissionDate"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admissionTime">
            Admission Time
          </label>
          <input
            type="time"
            id="admissionTime"
            value={admissionTime}
            onChange={(e) => setAdmissionTime(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          {isSubmitting ? 'Admitting...' : 'Admit Patient'}
        </button>
      </form>
    </div>
  );
};

export default AdmitPatient;