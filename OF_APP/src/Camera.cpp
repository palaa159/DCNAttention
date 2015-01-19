//
//  Camera.cpp
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#include "Camera.h"

using namespace ofxCv;
using namespace cv;


Camera::Camera(){
    
    finder.setup("haarcascade_frontalface_alt2.xml");
//    finder.setPreset(ObjectFinder::Sensitive);
//    finder.setPreset(ObjectFinder::Accurate);
//    finder.setPreset(ObjectFinder::Fast);
    
//    finder.getTracker().setSmoothingRate(.3); // play with this

//    finder.setMultiScaleFactor(1.2); //BETTER
//    finder.setMultiScaleFactor(1.1); //GOOD!
    
    finder.setPreset(ObjectFinder::Sensitive);
    finder.setRescale(.9f);
    finder.setMinNeighbors(1);
    finder.setMultiScaleFactor(1.3f); //BETTER
    finder.setMinSizeScale(.08f);
    finder.setMaxSizeScale(.4f);
    finder.setCannyPruning(false);
    finder.setFindBiggestObject(false);
    
    //*** STANDARD TO BEAT
//    finder.setPreset(ObjectFinder::Sensitive);
//    finder.setRescale(.5f);
//    finder.setMinNeighbors(1);
//    finder.setMultiScaleFactor(1.2f); //BETTER
//    finder.setMinSizeScale(.08f);
//    finder.setMaxSizeScale(.3f);
//    finder.setCannyPruning(false);
//    finder.setFindBiggestObject(false);
    
    
//    **** FAST:
//    finder.setRescale(.25);
//    finder.setMinNeighbors(2);
//    finder.setMultiScaleFactor(1.2);
//    finder.setMinSizeScale(.25);
//    finder.setMaxSizeScale(.75);
//    finder.setCannyPruning(true);
//    finder.setFindBiggestObject(false);

#ifdef USE_DEBUG_VIDEO
    grabber.loadMovie("test_brady.mov");
    grabber.setVolume(0.f);
    grabber.play();
#else
    ofSetLogLevel(OF_LOG_VERBOSE);
    grabber.listDevices();
    grabber.setDeviceID(1); // HD Pro Webcam *** CHANGE to 0 IF YOU DON'T HAVE A WEBCAM ATTACHED ****
    float vidScaleVal = 0.5f;
    grabber.initGrabber(1920*vidScaleVal, 1080*vidScaleVal);
    ofSetLogLevel(OF_LOG_NOTICE);
#endif
    
    sunglasses.loadImage("img/sunglasses.png");
    faceVal = 0.0;
}


//--------------------------------------------------------------
int Camera::update(){
    
    grabber.update();
    if(grabber.isFrameNew()) {
        finder.update(grabber);
        return finder.size();
    }
}

//--------------------------------------------------------------
float Camera::getFaceVal(){

    if(finder.size()>0){
        //calculate faceval here!
        faceVal=ofGetElapsedTimef();
    }
    return faceVal;
}


//--------------------------------------------------------------
void Camera::draw(){
    ofSetColor(255);

    //if(grabber.isInitialized()){
        grabber.draw(0, 0, grabber.getWidth()/2, grabber.getHeight()/2);
        
        for(int i = 0; i < finder.size(); i++) {
            ofRectangle object = finder.getObjectSmoothed(i);
            sunglasses.setAnchorPercent(.5, .5);
            float scaleAmount = .85 * (object.width / sunglasses.getWidth())/2;
            
            ofPushMatrix();
            ofTranslate((object.x + object.width / 2.)/2, (object.y + object.height * .42)/2);
            ofScale(scaleAmount, scaleAmount);
            sunglasses.draw(0, 0);
            ofPopMatrix();
            
//            ofPushMatrix();
//            ofTranslate(object.getPosition());
//            ofDrawBitmapStringHighlight(ofToString(finder.getLabel(i)), 0, 0);
//            ofLine(ofVec2f(), toOf(finder.getVelocity(i)) * 10);
//            ofPopMatrix();
        }
        
    //}
}

//--------------------------------------------------------------
int Camera::getNumFaces(){
    return finder.size();
}

//--------------------------------------------------------------
void Camera::listDevices(){
    cout << "hit list devices"<<endl;

}

