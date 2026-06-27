import React from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { legalContent } from '../../data/legalContent';

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout
      title={legalContent.privacyPolicy.title}
      lastUpdated={legalContent.privacyPolicy.lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: legalContent.privacyPolicy.content }} />
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
