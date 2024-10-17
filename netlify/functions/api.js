const { v4: uuidv4 } = require('uuid');

// In-memory database (replace with a proper database in production)
let patients = [];
let notes = [];

exports.handler = async (event, context) => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '');
  const method = event.httpMethod;

  try {
    switch (true) {
      case method === 'GET' && path === '/patients':
        return {
          statusCode: 200,
          body: JSON.stringify(patients),
        };

      case method === 'POST' && path === '/patients':
        const newPatient = JSON.parse(event.body);
        newPatient.id = uuidv4();
        patients.push(newPatient);
        return {
          statusCode: 201,
          body: JSON.stringify(newPatient),
        };

      case method === 'PUT' && path.match(/^\/patients\/[\w-]+$/):
        const patientId = path.split('/')[2];
        const updatedPatient = JSON.parse(event.body);
        const patientIndex = patients.findIndex(p => p.id === patientId);
        if (patientIndex !== -1) {
          patients[patientIndex] = { ...patients[patientIndex], ...updatedPatient };
          return {
            statusCode: 200,
            body: JSON.stringify(patients[patientIndex]),
          };
        }
        return { statusCode: 404, body: 'Patient not found' };

      case method === 'GET' && path.match(/^\/patients\/[\w-]+\/notes$/):
        const patientIdForNotes = path.split('/')[2];
        const patientNotes = notes.filter(note => note.patientId === patientIdForNotes);
        return {
          statusCode: 200,
          body: JSON.stringify(patientNotes),
        };

      case method === 'POST' && path === '/notes':
        const newNote = JSON.parse(event.body);
        newNote.id = uuidv4();
        notes.push(newNote);
        return {
          statusCode: 201,
          body: JSON.stringify(newNote),
        };

      case method === 'GET' && path === '/extract':
        const { startDate, endDate } = event.queryStringParameters;
        const extractedData = patients.filter(patient => {
          const admissionDate = new Date(patient.admissionDate);
          return admissionDate >= new Date(startDate) && admissionDate <= new Date(endDate);
        }).map(patient => {
          const patientNotes = notes.filter(note => 
            note.patientId === patient.id && 
            new Date(note.date) >= new Date(startDate) && 
            new Date(note.date) <= new Date(endDate)
          );
          return { ...patient, notes: patientNotes };
        });
        return {
          statusCode: 200,
          body: JSON.stringify(extractedData),
        };

      default:
        return { statusCode: 404, body: 'Not Found' };
    }
  } catch (error) {
    console.error('Error in API:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};