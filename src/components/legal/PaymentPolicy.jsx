import React from 'react';
import LegalPageLayout from '../LegalPageLayout';
import { legalContent } from '../../data/legalContent';

const PaymentPolicy = () => {
  return (
    <LegalPageLayout
      title={legalContent.paymentPolicy.title}
      lastUpdated={legalContent.paymentPolicy.lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: legalContent.paymentPolicy.content }} />
    </LegalPageLayout>
  );
};

export default PaymentPolicy;
