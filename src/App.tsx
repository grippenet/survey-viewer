import React, { useState } from 'react';
import { Survey } from 'survey-engine/data_types';
import Navbar from './components/NavbarComp';
import SurveyLoader from './components/SurveyLoader';
import SurveyMenu from './components/SurveyMenu';
import SurveyServiceLoader from './components/SurveyServiceLoader';
import { registerCustomComponents, registerParticipantFlags } from './localConfig';

interface AppState {
  selectedAppLanguage?: string; // Language of the Application (for future translation)
  surveyKey?: string;
  survey?: Survey;
  screen: Screens;
}

// Application translations, currently only english is provided.
const availableAppLanguages : string[] = ['en'];

const customResponseComponents = registerCustomComponents();
const participantFlags = registerParticipantFlags();

type Screens = 'loader' | 'menu';

const initialState: AppState = {
  screen: 'loader',
}

const surveyProviderUrl = process.env.REACT_APP_SURVEY_URL ?? "";

console.log("Using provider "+ surveyProviderUrl);

// Default languages to show in the survey. If several use the first available in the survey.
// You can customize the default survey languages by definiing REACT_APP_DEFAULT_SURVEY_LANGUAGES env variable
const defaultSurveyLanguages : string[] = (()=>{
  let defaultLang: string[] = ['en'];
  const envLang = process.env.REACT_APP_DEFAULT_SURVEY_LANGUAGES ?? "";
  if(envLang) {
    defaultLang = envLang.split(',').map(v => v.trim());
  }
  return defaultLang;
})();


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    ...initialState
  })

  const onLoadSurvey = (surveyObject: Survey) => {
    if (!surveyObject) {
      alert('No survey content found.');
      return;
    }


    const surveyDef = surveyObject.surveyDefinition;

    const surveyKey = surveyDef.key;

    setAppState({
      ...initialState,
      selectedAppLanguage: availableAppLanguages[0],
      surveyKey: surveyKey,
      screen: 'menu',
      survey: surveyObject
    })
  }

  const navigateTo = (screen: Screens) => {
    setAppState(prev => {
      return {
        ...prev,
        screen: screen
      }
    })
  }

  const reset = () => {
    setAppState({ ...initialState })
  }

  const pageContent = () => {
    switch (appState.screen) {
      case 'loader':
        return <div className="container d-flex align-items-center h-100" style={{
          minHeight: '70vh'
        }}>
          <div className="row flex-grow-1">
            <div className="col-12">
            {
                surveyProviderUrl ? <SurveyServiceLoader onSurveyLoaded={onLoadSurvey} surveyProviderUrl={surveyProviderUrl} /> : null
            }
            <SurveyLoader onSurveyLoaded={onLoadSurvey}/>
            </div>
          </div>
        </div>
        
      case 'menu':
        if (!appState.selectedAppLanguage || !appState.survey) {
          reset();
          return null;
        }
        return <SurveyMenu
          participantFlags={participantFlags}
          defaultSurveyLanguages={defaultSurveyLanguages}
          survey={appState.survey}
          customResponseComponents={customResponseComponents}
          onExit={() => {
            reset()
          }}
        />

    }
  }

  return (
    <div className="d-flex flex-column overflow-scroll" style={{
      minHeight: '100vh'
    }}>
      <Navbar
        surveyName={appState.surveyKey}
        selectedLanguage={appState.selectedAppLanguage}
        languagecodes={availableAppLanguages}
        onSelectLanguage={(code) => {
          setAppState(prev => {
            return {
              ...prev,
              selectedAppLanguage: code
            }
          })
        }}
      />
      <div className="flex-grow-1">
        {pageContent()}
      </div>
      <footer className="text-center py-2">
        Version: {process.env.REACT_APP_VERSION}
      </footer>
    </div>
  )
}

export default App;
