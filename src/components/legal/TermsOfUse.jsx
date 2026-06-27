import React from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { legalContent } from '../../data/legalContent';

const TermsOfUse = () => {
  return (
    <LegalPageLayout
      title={legalContent.termsOfUse.title}
      lastUpdated={legalContent.termsOfUse.lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: legalContent.termsOfUse.content }} />
    </LegalPageLayout>
  );
};

export default TermsOfUse;
