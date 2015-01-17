//
//  Camera.h
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#pragma once

#include "ofMain.h"
#include "ofxCv.h"

#define USE_VIDEO 0 //set to '0' for camera

class Camera {

public:
    Camera();
    int update();
    void draw();
    float getFaceVal();
    void listDevices();
    int getNumFaces();

    
private:
    
#if USE_VIDEO
    ofVideoPlayer grabber;
#else
    ofVideoGrabber grabber;
#endif
    
    ofxCv::ObjectFinder finder;
    ofImage sunglasses;
    float faceVal;
};