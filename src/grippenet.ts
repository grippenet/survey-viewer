import { LookupResponseComponent, registerLookupService } from 'grippenet-web-ui';

export const customResponseComponents = [
    {
      name: 'input:postalCodeLookup',
      component: LookupResponseComponent
    }
];

registerLookupService('postalcodes', process.env.REACT_APP_POSTALCODES_URL ?? '');

const BooleanValues = [
  {value: '0',label:'No'},
  {value: '1', label: "Yes"}
];

export const GnParticipantFlags = {
        // Influenzanet
        'prev': {
            label:"Has ongoing symptoms",
            values: BooleanValues,
        },
        'completedVaccSurvey': {
            label:"Has completed vaccination survey",
            values: BooleanValues,
        },

        // Grippenet
        'minor':{
            label:'Participant is minor',
            values: BooleanValues
        },
        ageVac: {
            'label':"Under age for Vaccination (6 month)",
            values: [
                {value: "0", label:"Can be vaccinated"},
                {value: "1", label:"Under vaccination age"}
            ]
        },
        mozartS0: {
            "label":"Has responded to Mozart S0 section",
            values: BooleanValues
        },
        reminderTester: {
            "label":"Tester for Reminder",
            values: BooleanValues,
        },
        needLocation: {
            "label":"Need location question to show up",
            values: BooleanValues,
        }
};