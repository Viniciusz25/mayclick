import React from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { legalContent } from '../../data/legalContent';

const CancellationPolicy = () => {
  return (
    <LegalPageLayout
      title={legalContent.cancellationPolicy.title}
      lastUpdated={legalContent.cancellationPolicy.lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: legalContent.cancellationPolicy.content }} />
    </LegalPageLayout>
  );
};

export default CancellationPolicy;
