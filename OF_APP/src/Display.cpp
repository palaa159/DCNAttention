//
//  Canvas.cpp
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#include "Display.h"
#include "ofApp.h"

Display::Display(){
    
    ofSetRectMode(OF_RECTMODE_CORNER);
    ofSetCircleResolution(100);
    
    ofBackground(255);
    
    initFonts();
    
    payRed.set(245, 58, 135);
    payLightGray.set(140, 140, 140);
    payDarkGray.set(50, 50, 50);
    
    timerSize = 100;
    timerVal = 15;
    Tweenzor::init();
    timerLoc.set(ofGetWidth()-175, ofGetHeight()-150);
    timerPos = 270.001f;
    
    roundOn = false;
    eyeLogo.loadImage("img/eye_white.png");
    eyeLogo.resize(eyeLogo.getWidth()*.45f, eyeLogo.getHeight()*.45f);
}


//--------------------------------------------------------------
void Display::update(int nFaces){
    
//    ((testApp*) ofGetAppPtr())->someVariableThatsInTestApp  = 100;
//    float faceV = ((ofApp*) ofGetAppPtr())->currContent.getFaceValue();
//    float socialV = ((ofApp*) ofGetAppPtr())->currContent.getSocialValue();

//    displayFaceVal = thisContent.getFaceValue();
//    displaySocialVal = thisContent.getSocialValue();
    Tweenzor::update( ofGetElapsedTimeMillis() );
    timerPos = ofWrap(timerPos, 0, 360);
    numFaces = nFaces;
    if(roundOn){
        int thisSec = int(ofGetElapsedTimef()) - timestamp;
        if(thisSec != lastSec) {
            timerVal -= 1;
            lastSec = thisSec;
            if(numFaces>0){
                displayFaceVal += 0.0382*numFaces;
                displayFaceVal = roundf(displayFaceVal * 100) / 100;
                //diplayTotalValue += 0.0382*numFaces;
            }
            //cout << "timerVal "<<timerVal<<endl;
        }
    }
    
    
    //numFaces = nFaces;
    //if(numFaces > 0){
    //    displayFaceVal += 0.01*numFaces;
    //    diplayTotalValue += 0.01*numFaces;
    //}
}


//--------------------------------------------------------------
void Display::draw(){
    
    if(displayImage.isAllocated()){
        if(displayImage.getWidth() < 1000){
            //displayImage.resize(displayImage.getWidth()*2, displayImage.getHeight()*2);
            float sizeFactor = ofGetWidth()/displayImage.getWidth();
            displayImage.resize(ofGetWidth(), displayImage.getHeight()*sizeFactor);
        }
        //float imgY = (displayImage.getHeight()<1080)? (1080-displayImage.getHeight()) : displayImage.getHeight();
        displayImage.draw(ofGetWidth()/2 - displayImage.getWidth()/2, 10);
        
        int leftMargin = 60;
        int topMargin = ofGetHeight()-300;
        int valuesLeftMargin = ofGetWidth()/2 + 250;
        int valuesRightMargin = ofGetWidth() - 550;
        
        ofSetColor(0, 150);
        ofFill();
        ofRect(0, topMargin, ofGetWidth(), ofGetHeight());
        
        ofSetColor(0);
        ofLine(0, topMargin, ofGetWidth(), topMargin);
        
        ofSetColor(payRed);
        labelsFont.drawString("Face Value", valuesRightMargin, topMargin+50);
        //labelsFont.drawString("Faces", valuesRightMargin, topMargin+200);


        ofSetColor(255);
        companyFont.drawString(displayCompany + " | "+displayCategory, leftMargin, topMargin+50);
        headlineFont.drawString(displayHeadline, leftMargin, topMargin+130);
        valueFont.drawString("$"+ofToString(displayFaceVal), valuesRightMargin, topMargin+130);


        eyeLogo.draw(valuesRightMargin, topMargin+170);
        valueFont.drawString(ofToString(numFaces), valuesRightMargin+eyeLogo.getWidth()+40, topMargin+220);
        
        //labelsFont.drawString("http://attention.market", leftMargin, topMargin-20);
        //labelsFont.drawString("Total Value", valuesLeftMargin+400, topMargin+50);
        //valueFont.drawString(ofToString(diplayTotalValue), valuesLeftMargin+400, topMargin+125);
        //valueFont.drawString("current Social Value: "+displaySocialVal, 50, 80);
        
        ofSetColor(payLightGray);
        ofCircle(timerLoc, timerSize);
        ofPath timerVis = ofPath();
        timerVis.setColor(payRed);
        timerVis.setCircleResolution(100);
        timerVis.arc(timerLoc, timerSize, timerSize, timerPos, 270, false);
        timerVis.draw();
        ofSetColor(payDarkGray);
        ofCircle(timerLoc, timerSize-20);
        ofSetColor(255);

        if(timerVal>9)timerFont.drawString(ofToString(timerVal), timerLoc.x-53, timerLoc.y+30);
        else timerFont.drawString(ofToString(timerVal), timerLoc.x-23, timerLoc.y+30);
    } else {
        ofSetColor(0);
        headlineFont.drawString("press space to begin", ofGetWidth()/2-400, ofGetHeight()/2+300);
    }
}



//--------------------------------------------------------------
void Display::startRound(vector <ofxJSONElement> thisPair){
    
    leftScreen.init(thisPair[0]);
    rightScreen.init(thisPair[1]);
    
    cout << ">>>> LEFT SCREEN <<<<<\n";
    cout << "objectId:      \t"<<thisPair[0]["objectId"].asString();
    cout << "\nimgLocalPath:\t"<< leftScreen.getImgLocalPath();
    cout << "\nheadline:    \t"<< leftScreen.getHeadline();
    cout << "\nface value:  \t"<< leftScreen.getFaceValue();
    cout << "\nsocial value:\t"<< leftScreen.getSocialValue();
    
    displayImage = leftScreen.getImgLocalPath();
    displayFaceVal = leftScreen.getFaceValue();
    displaySocialVal = leftScreen.getSocialValue();
    displayCategory = leftScreen.getCategoryName();
    displayHeadline = leftScreen.getHeadline();
    displayCompany = leftScreen.getCompany();
    diplayTotalValue = leftScreen.getTotalValue(); //float
    displayObjectId = thisPair[0]["objectId"].asString();
    shownCount = thisPair[0]["shown"].asInt();
    
    
    int lineBreakIdx = 28;
    if(displayHeadline.size() > lineBreakIdx){
        //split the string
        displayHeadline.insert(lineBreakIdx, "\n");
    }
    
    
    timestamp = int(ofGetElapsedTimef());
    lastSec = 0;
    cout << timestamp << endl;
    timerVal = 15;
    timerPos = 0.f;
    // _property,  a_begin,  a_end,  a_delay,  a_duration, int a_easeType, float a_p, float a_a) {
    Tweenzor::add(&timerPos, 270.f, 630.f, 0.f, 15.f, EASE_IN_OUT_SINE);
    
    Tweenzor::getTween( &timerPos )->setRepeat( 0, false );
    Tweenzor::addCompleteListener( Tweenzor::getTween(&timerPos), this, &Display::onRoundComplete);
    roundOn = true;
}


//--------------------------------------------------------------
void Display::onRoundComplete(float* arg) {
    
    roundOn = false;
    
    timerPos = 270;
    timerVal = 0;
    
    cout << ">>>>> ROUND COMPLETE <<<<<<" << endl;
    cout << "=========================================="<<endl;
    //cout << "Display::onComplete : arg = " << *arg << endl;

    //Tweenzor::resetAllTweens();
    Tweenzor::removeTween(&timerPos);
    float faceDiff = displayFaceVal - leftScreen.getFaceValue();
    
    shownCount++;
    string updateObj = "{\"face_val\":"+ofToString(displayFaceVal)+",\"shown\":"+ofToString(shownCount)+"}";
    string updateObj2 = "{\"val_history\":{\"__op\":\"Add\",\"objects\":[{\"face_val\":"+ofToString(faceDiff)+",\"social_val\":0,\"ts\":"+ofToString(ofGetUnixTime())+"000}]}}";
    string completeUpdate =
    "{\"requests\": [{\"method\": \"PUT\",\"path\": \"/1/classes/content_dummy_new/"+displayObjectId+"\",\"body\": "+ updateObj + "},{\"method\": \"PUT\",\"path\": \"/1/classes/content_dummy_new/"+displayObjectId+"\",\"body\": " + updateObj2 + "}]}";    
    
    
    ((ofApp*)ofGetAppPtr())->dataConnect.pushData(displayObjectId, completeUpdate);
    ((ofApp*)ofGetAppPtr())->dataConnect.pullData();
    //((ofApp*)ofGetAppPtr())->nextRound(); //now down from pullData()
}

//--------------------------------------------------------------
void Display::initFonts(){
    
    ofTrueTypeFont::setGlobalDpi(72);
    
    
    headlineFont.loadFont("fonts/Lato-Bold.ttf", 72, true, true, true);
    headlineFont.setLineHeight(80.0f);
    headlineFont.setSpaceSize(0.6f);
    headlineFont.setLetterSpacing(1.0);
    
    companyFont.loadFont("fonts/Lato-Semibold.ttf", 40, true, true, true);
    companyFont.setSpaceSize(0.7f);
    companyFont.setLetterSpacing(1.0);
    
    timerFont.loadFont("fonts/Lato-Bold.ttf", 96, true, true, true);
    timerFont.setLineHeight(18.0f);
    timerFont.setLetterSpacing(1.0);
    
    valueFont.loadFont("fonts/Lato-Bold.ttf", 72, true, true, true);
    valueFont.setLineHeight(18.0f);
    valueFont.setLetterSpacing(1.0);
    
    labelsFont.loadFont("fonts/Lato-Medium.ttf", 42, true, true, true);
    labelsFont.setLineHeight(18.0f);
    labelsFont.setLetterSpacing(1.0);
}