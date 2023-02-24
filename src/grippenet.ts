import { LookupResponseComponent, registerLookupService } from 'grippenet-web-ui';

export const customResponseComponents = [
    {
      name: 'input:postalCodeLookup',
      component: LookupResponseComponent
    }
];

registerLookupService('postalcodes', process.env.REACT_APP_POSTALCODES_URL ?? '');
