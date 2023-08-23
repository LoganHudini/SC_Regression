export const configuration = {
  name: 'sofitel-manila',
  hotelId: '259034ee-3f5c-43b0-9332-dffd85ccba65',
  modules: [
    {
      name: 'checkin',
      submodules: [
        {
          name: 'information',
          label: 'Check-In',
          title: 'Please Complete Your Check-In Process',
          isActive: 'true',
          reservationInfoNeeded: {
            isActive: 'true',
            details: [
              { name: 'checkinDate', label: 'CHECK IN' },
              { name: 'checkoutDate', label: 'CHECK OUT' },
              { name: 'noOfGuest', label: 'NUMBER OF GUESTS' },
            ],
          },
          details: [
            {
              name: 'Guest Information',
              type: 'manual-entry',
              details: [
                {
                  name: 'firstName',
                  label: 'First Name',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'firstName',
                  label: 'First Name',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'lastName',
                  label: 'Last Name',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'phone',
                  label: 'Phone',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
              ],
            },
            {
              name: 'Credit Card Info',
              isActive: 'true',
              type: 'cybersource',
              details: [
                {
                  name: 'cardNumber',
                  label: 'Card Number',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'cardHolderName',
                  label: 'Card Holder Name',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'cardType',
                  label: 'Card Type',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'expirydDate',
                  label: 'Expiry Date',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
                {
                  name: 'cvv',
                  label: 'Cvv',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
              ],
            },
            {
              name: 'Identity Verification',
              type: 'manual-entry',
              isActive: 'true',
              details: [
                {
                  name: 'documentType',
                  label: 'Document Type',
                  type: 'Dropdown',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                  options: [
                    { name: 'Passport', value: 'PASS' },
                    { name: 'ID Card', value: 'UNKNOWN' },
                  ],
                },
                {
                  name: 'documentNumber',
                  label: 'Document Number',
                  type: 'Text',
                  required: 'true',
                  isDisabled: 'false',
                  isActive: 'true',
                },
              ],
            },
          ],
        },
        {
          name: 'accompanyingGuest',
          label: 'Secondary Guest',
          title: '',
          type: 'manual-entry',
          isActive: 'true',
          details: [
            {
              name: 'firstName',
              label: 'First Name',
              type: 'Text',
              required: 'true',
              isDisabled: 'false',
              isActive: 'true',
            },
            {
              name: 'lastName',
              label: 'Last Name',
              type: 'Text',
              required: 'true',
              isDisabled: 'false',
              isActive: 'true',
            },
            {
              name: 'email',
              label: 'Email',
              type: 'Text',
              required: 'true',
              isDisabled: 'false',
              isActive: 'true',
            },
            {
              name: 'phone',
              label: 'Phone',
              type: 'Text',
              required: 'true',
              isDisabled: 'false',
              isActive: 'true',
            },
          ],
        },
        {
          name: 'personalisation',
          label: 'Cutomize My Stay',
          title: '',
          type: 'cms',
          isActive: 'true',
        },
        {
          name: 'review',
          label: 'Review & Sign',
          title: 'Check In',
          subTitle:
            'Please review and confirm the below information to complete the Check In process',
          type: 'cms',
          isActive: 'true',
          guestInformationDetails: [
            {
              title: 'Guest Information',
            },
            {
              checkIn: 'Check In',
              checkOut: 'Check Out',
            },
          ],
          creditCardDetails: [
            {
              title: 'Credit Card Info',
            },
          ],
          identityVerificationDetails: [
            {
              title: 'Identity Verification',
            },
            {
              name: 'docType',
              cmsName: 'DOCUMENT_TYPE',
              label: 'Doc Type',
            },
            {
              name: 'docNo',
              cmsName: 'DOCUMENT_NUMBER',
              label: 'ID Number',
            },
            {
              name: 'effectiveDate',
              cmsName: 'DATE_OF_ISSUE',
              label: 'Effective date',
            },
            {
              name: 'expiryDate',
              cmsName: 'DATE_OF_EXPIRY',
              label: 'Expiry date',
            },
            {
              name: 'issueCountry',
              cmsName: 'COUNTRY',
              label: 'Issue country',
            },
          ],
        },
      ],
    },
  ],
};
