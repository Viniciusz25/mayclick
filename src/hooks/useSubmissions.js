import { useState } from 'react';

const useSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  const addSubmission = (newSubmission) => {
    const submissionWithId = {
      ...newSubmission,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedSubmissions = [submissionWithId, ...submissions];
    setSubmissions(updatedSubmissions);
    return submissionWithId;
  };

  const getSubmissionById = (id) => {
    return submissions.find(s => s.id === id);
  };

  const deleteSubmission = (id) => {
    const updatedSubmissions = submissions.filter(s => s.id !== id);
    setSubmissions(updatedSubmissions);
  };

  return {
    submissions,
    addSubmission,
    getSubmissionById,
    deleteSubmission
  };
};

export default useSubmissions;
