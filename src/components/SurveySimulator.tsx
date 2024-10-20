import { AlertBox, SurveyView, Dialog, DialogBtn } from 'case-web-ui';
import React, {  useState } from 'react';
import { Button, Card, CardBody } from 'react-bootstrap';
import { Survey, SurveyContext, SurveySingleItemResponse } from 'survey-engine/data_types';
import { nl, nlBE, fr, de, it, da, es, pt } from 'date-fns/locale';
import { SurveyEngineCore } from 'survey-engine/engine';
import { EngineState, SurveyInspector } from './SurveyInspector';
import { CustomSurveyResponseComponent } from 'case-web-ui';
import clsx from 'clsx';
import { SurveyAndContext } from '../types';
import SurveyInfo from './SurveyInfo';

const dateLocales = [
    { code: 'nl', locale: nl, format: 'dd-MM-yyyy' },
    { code: 'nl-be', locale: nlBE, format: 'dd.MM.yyyy' },
    { code: 'fr-be', locale: fr, format: 'dd.MM.yyyy' },
    { code: 'de-be', locale: de, format: 'dd.MM.yyyy' },
    { code: 'it', locale: it, format: 'dd/MM/yyyy' },
    { code: 'fr', locale: fr, format: 'dd/MM/yyyy'},
    { code: 'dk', locale: da, format: 'dd/MM/yyyy'},
    { code: 'es', locale: es, format: 'dd/MM/yyyy'},
    { code: 'pt', locale: pt, format: 'dd/MM/yyyy'},
];

export interface SurveyUILabels {
    backBtn: string;
    nextBtn: string;
    submitBtn: string;
    invalidResponseText: string;
    noSurveyLoaded: string;
}

export interface SimulatorUIConfig {
    texts: SurveyUILabels;
    showKeys: boolean;
}

interface SurveySimulatorProps {
    config: SimulatorUIConfig;
    surveyAndContext?: SurveyAndContext;
    prefills?: SurveySingleItemResponse[];
    defaultSurveyLanguages: string[];
    customResponseComponents?:CustomSurveyResponseComponent[]
    onExit: () => void;
    onSaveAsPrefill: (p: SurveySingleItemResponse[])=>void;
    onReset: () => void;
}


const SurveySimulator: React.FC<SurveySimulatorProps> = (props) => {

    const surveyDefinition = props.surveyAndContext ? props.surveyAndContext.survey.surveyDefinition : undefined;

    const languageCodes: string[] = []; // Available language codes in the survey

    if(props.surveyAndContext?.survey) {
        props.surveyAndContext.survey.props?.name?.map(o => languageCodes.push(o.code));
    }

    const [openSurveyEndDialog, setOpenSurveyEndDialog] = useState(false);
    const [surveyResponseData, setSurveyResponseData] = useState<SurveySingleItemResponse[]>([]);

    const [engineState, setEngineState ] = useState<EngineState>(new EngineState(surveyDefinition));
    const [evaluatorCounter, setEvaluatorCounter ] = useState<number>(0); // Ok to show the evaluator (after engineReady is true)
    const [showEvaluator, setShowEvaluator] = useState<boolean>(false);

    const [showKeys, setShowKeys ] = useState<boolean>(props.config.showKeys);

    const [languageCode, setLanguageCode] = useState<string>(()=> {
        let defaultLanguage = 'en'; // fallback
        if(languageCodes) {
            const def = props.defaultSurveyLanguages.find(lang => languageCodes.includes(lang));
            if(def) {
                defaultLanguage = def;
            }
        }
        return defaultLanguage;
    });

    const onResponseChanged=(responses: SurveySingleItemResponse[], version: string, engine?: SurveyEngineCore) => {
        console.log(responses, engineState.engine, engine);
        if(engine) {
            engineState.setEngine(engine);
            engineState.setResponses(responses);
            engineState.update();
            setEvaluatorCounter(evaluatorCounter + 1);
        } else {
            console.warn("Engine instance is not passed to callback, not able to use evaluator");
        }
    }
       
    const toggleEvaluator = () => {
        setShowEvaluator(!showEvaluator)
    }

    const surveySubmitDialog = <Dialog
        title="Survey Finished"
        size='lg'
        onClose={() => {
            setSurveyResponseData([]);
            setOpenSurveyEndDialog(false);
            props.onExit();
        }}
        open={openSurveyEndDialog}
        ariaLabelledBy="title"
    >
        <div className="px-3 py-2a">
            <p>Survey finished. What do you want to do next?</p>
            <DialogBtn
                className="me-2"
                onClick={() => {
                    setSurveyResponseData([]);
                    setOpenSurveyEndDialog(false);
                    props.onExit();
                }}
                label="Exit without Save"
                outlined={true}
            />
            <DialogBtn
                className="me-2"
                onClick={() => {
                    const response = surveyResponseData;
                    setSurveyResponseData([]);
                    props.onSaveAsPrefill(response);
                    props.onReset();
                    setOpenSurveyEndDialog(false);
                }}
                label="Store as prefill for next survey"
                outlined={true}
            />
            <DialogBtn
                onClick={() => {

                    const exportData = surveyResponseData;
                    var a = document.createElement("a");
                    var file = new Blob([JSON.stringify(exportData, undefined, 2)], { type: 'json' });
                    a.href = URL.createObjectURL(file);
                    a.download = `${props.surveyAndContext?.survey.surveyDefinition.key}_responses_${(new Date()).toLocaleDateString()}.json`;
                    a.click();

                    setSurveyResponseData([]);
                    setOpenSurveyEndDialog(false)
                    props.onExit()
                }}
                label="Save as file and Exit"
            />
        </div>

    </Dialog>

    const languageSelector = (code:string, index:number) => {
        const btn = code == languageCode ? 'btn-primary' : 'btn-info';
        return <li key={index} className='ml-1 p-1'><span className={clsx("btn btn-sm rounded", btn)} onClick={()=>setLanguageCode(code)}>{code}</span></li>;
    }

    console.log('prefills', props.prefills);

    return (
        <div className="container-fluid">
            <div className='row'>
            <div className="col p-1">
                <Button onClick={()=>{ if (window.confirm('Do you want to exit the simulator (will lose state)?')) {
                                    props.onExit();
                                }}} variant="warning" className="me-1"> Exit</Button>
                
                <Button className="me-1"  onClick={toggleEvaluator}>Show inspector</Button>
                <Button className="me-1"  onClick={()=>props.onReset()}>Reset survey</Button>
                <label className='d-inline mx-1'><input type="checkbox" checked={showKeys} onClick={()=>setShowKeys(!showKeys)}/> Show keys</label>
                <div className='d-inline p-1 border rounded'>
                Languages : 
                <ul className="list-inline">
                    { languageCodes.map(languageSelector) }
                </ul>                
                </div>
            </div>
            </div>
            <div className={ clsx(showEvaluator ? "container-fluid" : 'container', " pt-3") }>
                <div className="row">
                    <div className={ clsx( showEvaluator ? "col-7" : "col-10") }>
                        {props.surveyAndContext ? (
                            <div>
                            <SurveyInfo survey={props.surveyAndContext.survey} languageCode={languageCode}/>
                            <SurveyView
                                loading={false}
                                showKeys={showKeys}
                                survey={props.surveyAndContext.survey}
                                context={props.surveyAndContext.context}
                                prefills={props.prefills}
                                languageCode={languageCode}
                                onSubmit={(responses,) => {
                                    setSurveyResponseData(responses.slice())
                                    setOpenSurveyEndDialog(true);
                                }}
                                onResponsesChanged={onResponseChanged}
                                nextBtnText={props.config.texts.nextBtn}
                                backBtnText={props.config.texts.backBtn}
                                submitBtnText={props.config.texts.submitBtn}
                                invalidResponseText={props.config.texts.invalidResponseText}
                                dateLocales={dateLocales}
                                customResponseComponents={props.customResponseComponents}
                            />
                            </div>) :
                            <AlertBox type="danger"
                                useIcon={true}
                                content={props.config.texts.noSurveyLoaded}
                            />
                        }
                    </div>
                    <div className={ clsx( showEvaluator ? "col-5" : "d-none" ) }>
                        { evaluatorCounter ? <SurveyInspector engineState={engineState} update={evaluatorCounter} /> : <p>Select at least a response to show the inspector</p> }
                    </div>
                </div>
            </div>
            {surveySubmitDialog}
        </div >
    );
};

export default SurveySimulator;
