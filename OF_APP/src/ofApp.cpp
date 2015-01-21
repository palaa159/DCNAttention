
#include "ofApp.h"


void ofApp::setup() {

    ofSetVerticalSync(true);
    ofSetFrameRate(60);
    ofEnableAlphaBlending();
    
    display = *new Display();
    cam = *new Camera();

    CURR_CAT = 0;
    CURR_CAT_URL = 0;
    
#ifdef MASTER
    oscSendHost = RIGHT_SCREEN_IP;
    oscSendPort = 9000;
    oscRecvPort = 9001;
#else
    oscSendHost = LEFT_SCREEN_IP;
    oscSendPort = 9001;
    oscRecvPort = 9000;
#endif
    oscSender.setup(oscSendHost, oscSendPort);
    oscRecvr.setup(oscRecvPort);
    waitingCallback = false;
    
    //*** immediately init local data files ***//
    // query /api/getcontents, compare with local files
    //***** HERE ****
    dataConnect.pullData();
    
    
}


//--------------------------------------------------------------
void ofApp::update() {
    
    ofSetWindowTitle("fps: "+ ofToString(ofGetFrameRate()));
    
    cam.update();

    display.update(cam.getNumFaces());
    
    if(oscRecvr.hasWaitingMessages()){ //TODO: check how dangerous this blocking while is
        ofxOscMessage m;
        oscRecvr.getNextMessage(&m);
        cout<< "m.getAddress: "<<m.getAddress()<<endl;
        string incomingHostIp = m.getRemoteIp();
        cout << "\n-----------------\n\nRECVD OSC MESSAGE FROM IP: "+m.getRemoteIp()<<endl;
        cout << " /address: "<< m.getAddress() << endl;
        //cout << "\t MSG: "+ getOscMsgAsString(m) << "\n\n------------";
        if(std::find(knownClients.begin(), knownClients.end(), incomingHostIp)
           == knownClients.end()){
            knownClients.push_back(incomingHostIp); //add new host to list
        }
        if(m.getAddress() == "/round"){
            ofxJSONElement thisObj;
            thisObj = ofxJSONElement(m.getArgAsString(0));
            
            //send callback
            ofxOscMessage n;
            n.setAddress("/callback");
            n.addIntArg(1);
            oscSender.sendMessage(n);
            
            display.startRound(thisObj);
        }
        else if(m.getAddress() == "/callback"){
            cout << "GOT CALLBACK, STARTING ROUND";
            waitingCallback = false;
            display.startRound(thisPair[0]);
            dataConnect.sendShowing(thisPair[0]["objectId"].asString(), thisPair[1]["objectId"].asString(), ofToString(CURR_CAT_URL));

        }
    }
    
    if(waitingCallback){
        ofSleepMillis(100);
        sendRound();
    }
}


//--------------------------------------------------------------
void ofApp::draw() {
 
    display.draw();
    
    if(CAM_DEBUG){
        cam.draw();
    }
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){

    switch (key) {
        case 'c':
            CAM_DEBUG = !CAM_DEBUG;
            break;
        case 'f':
            ofToggleFullscreen();
            break;
        case 'd':
            dataConnect.pullData();
            break;
        case ' ':
            if(!GO_MODE){
                GO_MODE = true;
                nextRound();
            } else{
                 GO_MODE = false;
            }
            break;
        case 'r':
            sendRound();
            break;
        default:
            break;
    }
}


//--------------------------------------------------------------
void ofApp::nextRound(){
    
    if (GO_MODE){
        cout << "THIS ROUND CATEGORY INDEX: "<<CURR_CAT<<endl;
        
        ofxJSONElement category = dataConnect.getCategory(CURR_CAT);
        cout << "LENGTH: "<<category.size() << endl;
        int lowestShowCt = category[0]["shown"].asInt(); //start with shownCt of first obj
        cout << "first lowestShowCt: "<< lowestShowCt << endl;
        thisPair.clear();
        int objNum = 0;
        
        for(int i=0; i<category.size(); i++){
            ofxJSONElement thisObj = category[i];
            //cout << "category[i] "<<i<<endl;
            int thisObjShownCt = category[i]["shown"].asInt();
            if(thisObjShownCt <= lowestShowCt){
                lowestShowCt = thisObjShownCt; //new low
                objNum = i; //in case we only get one with lowest count later
                thisPair.push_back(thisObj);
                if(thisPair.size()>=2) break;
            }
        }
        cout << "finished first pass"<<endl;
        if(thisPair.size() < 2){ //we only had one obj with the lowest show ct
            objNum = int(ofWrap(objNum+1, 0, category.size()-1)); //TODO: find a better way to get the next one
            cout<<">> adding objNum: "<<objNum<<endl;
            thisPair.push_back(category[objNum]);
        }
        // cout<< "THIS ROUND OBJECTS: "<<endl;
        //cout << "\t left screen: "<<thisPair[0]["objectId"].asString()<<endl;
        //cout << "\t right screen: "<<thisPair[1]["objectId"].asString()<<endl;
        // print entire objects
        cout<< thisPair[0].getRawString() << endl;
        cout<< thisPair[1].getRawString() << endl;
        
        //********** HERE *********//
        sendRound();
        //display.startRound(thisPair[0]);
        
        //display.startRound(thisPair[0]);
        CURR_CAT_URL = CURR_CAT+1;
        CURR_CAT++;
        if(CURR_CAT > NUM_CATEGORIES-1) CURR_CAT = 0;
    }
}
//--------------------------------------------------------------
void ofApp::sendRound(){
    cout << "SENDING ROUND "<<endl;
    ofxOscMessage m;
    m.setAddress("/round");
    m.addStringArg(thisPair[1].getRawString());
    oscSender.sendMessage(m);
    waitingCallback = true;
}

//--------------------------------------------------------------
string ofApp::getOscMsgAsString(ofxOscMessage m){
    string msg_string;
    msg_string = m.getAddress();
    msg_string += ":";
    for(int i = 0; i < m.getNumArgs(); i++){
        // get the argument type
        msg_string += " " + m.getArgTypeName(i);
        msg_string += ":";
        // display the argument - make sure we get the right type
        if(m.getArgType(i) == OFXOSC_TYPE_INT32){
            msg_string += ofToString(m.getArgAsInt32(i));
        }
        else if(m.getArgType(i) == OFXOSC_TYPE_FLOAT){
            msg_string += ofToString(m.getArgAsFloat(i));
        }
        else if(m.getArgType(i) == OFXOSC_TYPE_STRING){
            msg_string += m.getArgAsString(i);
        }
        else{
            msg_string += "unknown";
        }
    }
    return msg_string;
}

//--------------------------------------------------------------
void ofApp::broadcastMessage(string message){
    
    //create a new OSC message
    ofxOscMessage m;
    m.setAddress("/chatlog");
    m.addStringArg(message);
    //m.addBlobArg(<#ofBuffer argument#>);
    
    //Send message to all known hosts
    // use another port to avoid a localhost loop
    for(unsigned int i = 0; i < knownClients.size(); i++){
        oscSender.setup(knownClients[i], 9002);
        m.setRemoteEndpoint(knownClients[i], 9002);
        oscSender.sendMessage(m);
        ofLogVerbose("Server broadcast message " + m.getArgAsString(0) + " to " + m.getRemoteIp()
                     + ":" + ofToString(m.getRemotePort()));
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){
    
}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){
    
}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){
    
}