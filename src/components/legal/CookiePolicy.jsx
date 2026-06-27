import React from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { legalContent } from '../../data/legalContent';

const CookiePolicy = () => {
  return (
    <LegalPageLayout
      title={legalContent.cookiePolicy.title}
      lastUpdated={legalContent.cookiePolicy.lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: legalContent.cookiePolicy.content }} />
    </LegalPageLayout>
  );
};

export default CookiePolicy;
