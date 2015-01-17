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
    finder.setPreset(ObjectFinder::Sensitive);
//    finder.setPreset(ObjectFinder::Accurate);
//    finder.setPreset(ObjectFinder::Fast);
//    finder.getTracker().setSmoothingRate(.3); // play with this
    finder.setRescale(.5);
    finder.setMinNeighbors(1);
    finder.setMultiScaleFactor(1.2);
//    finder.setMultiScaleFactor(1.1); //GOOD!
    finder.setMinSizeScale(.1);
    finder.setMaxSizeScale(.4);
    finder.setCannyPruning(false);
    finder.setFindBiggestObject(false);
    
//    **** FAST:
//    setRescale(.25);
//    setMinNeighbors(2);
//    setMultiScaleFactor(1.2);
//    setMinSizeScale(.25);
//    setMaxSizeScale(.75);
//    setCannyPruning(true);
//    setFindBiggestObject(false);

#if USE_VIDEO
    grabber.loadMovie("test_brady.mov");
    grabber.setVolume(0.f);
    grabber.play();
#else
    ofSetLogLevel(OF_LOG_VERBOSE);
    grabber.listDevices();
    grabber.setDeviceID(1); // HD Pro Webcam *** CHANGE to 0 IF YOU DON'T HAVE A WEBCAM ATTACHED ****
    grabber.initGrabber(1920, 1080);
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
        
        grabber.draw(0, 0);
        
        for(int i = 0; i < finder.size(); i++) {
            ofRectangle object = finder.getObjectSmoothed(i);
            sunglasses.setAnchorPercent(.5, .5);
            float scaleAmount = .85 * object.width / sunglasses.getWidth();
            
            ofPushMatrix();
            ofTranslate(object.x + object.width / 2., object.y + object.height * .42);
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
void Camera::listDevices(){
    cout << "hit list devices"<<endl;

}

