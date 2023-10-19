import { CustomSurveyResponseComponent } from 'case-web-ui';
import { customResponseComponents, GnParticipantFlags } from './grippenet';
import { ParticipantFlags } from './types/flags';

export const registerCustomComponents = () : CustomSurveyResponseComponent[] | undefined => {
    return customResponseComponents;
}

export const registerParticipantFlags = () : ParticipantFlags => {
    return GnParticipantFlags;
}
