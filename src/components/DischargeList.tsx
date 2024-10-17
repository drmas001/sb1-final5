import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '../types';
import { UserMinus, Calendar, Clock, Search } from 'lucide-react';

interface DischargeListProps {
  patients: Patient[];
  onRequestDischarge: (mrn: string) => Promise<void>;
}

const DischargeList: React.FC<DischargeListProps> = ({ patients, onRequestDischarge }) => {
  const [searchMRN, setSearchMRN] = useState('');
  const [searchResult, setSearchResult] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePatients = patients.filter(patient => patient.status === 'Active');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundPatient = patients.find(patient => patient.mrn === searchMRN && patient.status === 'Active');
    setSearchResult(foundPatient || null);
    setError(foundPatient ? null : 'No active patient found with the given MRN.');
  };

  const handleRequestDischarge = async () => {
    if (searchResult) {
      try {
        await onRequestDischarge(searchResult.mrn);
        setSearchMRN('');
        setSearchResult(null);
        setError('Patient discharge request submitted successfully.');
      } catch (error) {
        setError('An error occurred while requesting discharge. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center">
        <UserMinus className="mr-2" />
        Discharge Patients
      </h2>

      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          value={searchMRN}
          onChange={(e) => setSearchMRN(e.target.value)}
          placeholder="Enter patient MRN"
          className="input flex-grow"
        />
        <button type="submit" className="btn btn-primary">
          <Search className="w-5 h-5 mr-2" />
          Search
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {searchResult && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{searchResult.name}</dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">MRN</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{searchResult.mrn}</dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(searchResult.admissionDate).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={handleRequestDischarge}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Request Discharge
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Active Patients</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {activePatients.map(patient => (
              <li key={patient.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserMinus className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600">{patient.name}</div>
                      <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-1" />
                    <div className="text-sm text-gray-500 mr-4">
                      {new Date(patient.admissionDate).toLocaleDateString()}
                    </div>
                    <Clock className="h-5 w-5 text-gray-400 mr-1" />
                    <div className="text-sm text-gray-500 mr-4">
                      {new Date(patient.admissionDate).toLocaleTimeString()}
                    </div>
                    <Link
                      to={`/discharge/${patient.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Discharge
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DischargeList;