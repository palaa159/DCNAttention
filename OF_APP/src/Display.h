//
//  Display.h
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#pragma once

#include "ofMain.h"
#include "ContentModel.h"
#include "ofxTweenzor.h"
#include "ofxJSON.h"
#include "ofxTextBlock.h"

class Display {
    
public:
    Display();
    void update(int nFaces);
    void draw();
    void startRound(ofxJSONElement thisObj);
    void onRoundComplete(float* arg);
    
    
private:
    void initFonts();
    ofTrueTypeFont	headlineFont;
    ofTrueTypeFont	companyFont;
    ofTrueTypeFont	timerFont;
    ofTrueTypeFont	valueFont;
    ofTrueTypeFont	labelsFont;
    
    ofxTextBlock headline;
    TextBlockAlignment  alignment;
    
    float displayFaceVal;
    float displaySocialVal;
    float refSocialVal;
    float diplayTotalValue;
    string displayHeadline;
    string displayCompany;
    string displayCategory;
    string displayObjectId;
    int shownCount;
    
    
    ofImage displayImage;
    ofImage eyeLogo;
    ofImage payLogo;
    
    int numFaces;
    
    bool roundOn; //true when we're running a round
    
    int timerVal; //number inside timer
    int timerSize;    //size of timer
    ofVec2f timerLoc; //x,y
    float timerPos;   //arc progress bar
    float timerPosMapped;
    long timestamp; //for timerVal calc
    int lastSec;
    
    ofColor payRed;
    ofColor payLightGray;
    ofColor payDarkGray;
    
    ContentModel thisScreen;
    
};