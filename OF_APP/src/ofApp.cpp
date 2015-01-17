
#include "ofApp.h"


void ofApp::setup() {

    ofSetVerticalSync(true);
    ofSetFrameRate(60);
    ofEnableAlphaBlending();
    
    
    display = *new Display();
    cam = *new Camera();

    //*** immediately init local data files ***//
    // query /api/getcontents, compare with local files
    dataConnect.pullData();
    
    CURR_CAT = 0;
}


//--------------------------------------------------------------
void ofApp::update() {
    
    ofSetWindowTitle("fps: "+ ofToString(ofGetFrameRate()));
    

    int numFaces = cam.update();
//    int numFaces = 1;

    display.update(cam.getNumFaces());
    
    
    
    //if(currContentIdx>=0){
    //    allContent[currContentIdx].update(cam.getFaceVal());
    //display.update(numFaces, allContent[currContentIdx]);
    //}
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
            } else GO_MODE = false;
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
        vector <ofxJSONElement> thisPair;
        int objNum = 0;
        
        for(int i=0; i<category.size(); i++){
            ofxJSONElement thisObj = category[i];
            cout << "category[i] "<<i<<endl;
            int thisObjShownCt = category[i]["shown"].asInt();
            if(thisObjShownCt <= lowestShowCt){
                lowestShowCt = thisObjShownCt; //new low
                objNum = i; //in case we only get one with lowest count later
                thisPair.push_back(thisObj);
                if(thisPair.size()>=2) break;
            }
        }
        
        if(thisPair.size() < 2){ //we only had one obj with the lowest show ct
            objNum = int(ofWrap(objNum+1, 0, category.size())); //TODO: find a better way to get the next one
            thisPair[1] = category[objNum];
        }
        
        dataConnect.sendShowing(thisPair[0]["objectId"].asString(), thisPair[1]["objectId"].asString(), ofToString(CURR_CAT+1));
        
        display.startRound(thisPair);
        
        // cout<< "THIS ROUND OBJECTS: "<<endl;
        //cout << "\t left screen: "<<thisPair[0]["objectId"].asString()<<endl;
        //cout << "\t right screen: "<<thisPair[1]["objectId"].asString()<<endl;
        // print entire objects
        //cout<< thisPair[0].getRawString() << endl;
        //cout<< thisPair[1].getRawString() << endl;
        
        
        CURR_CAT++;
        if(CURR_CAT > NUM_CATEGORIES-1) CURR_CAT = 0;
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