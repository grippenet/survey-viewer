import { CustomSurveyResponseComponent } from 'case-web-ui';
import { customResponseComponents } from './grippenet';

export const registerCustomComponents = () : CustomSurveyResponseComponent[] | undefined => {
    return customResponseComponents;
}