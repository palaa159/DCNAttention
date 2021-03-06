//
//  Display.cpp
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
    payLightGray.set(200, 200, 200);
    payDarkGray.set(50, 50, 50);
    
    timerSize = 100;
    timerVal = 15;
    Tweenzor::init();
    timerLoc.set(ofGetWidth()-175, ofGetHeight()-150);
    timerPos = 0.0f;
    timerPosMapped = 270.001f;
    
    roundOn = false;
    eyeLogo.loadImage("img/eye_white.png");
    eyeLogo.resize(eyeLogo.getWidth()*.45f, eyeLogo.getHeight()*.45f);
    
    payLogo.loadImage("img/logo_new.png");
}


//--------------------------------------------------------------
void Display::update(int nFaces){
    
    numFaces = nFaces;
    
    if(roundOn){
        Tweenzor::update( ofGetElapsedTimeMillis() );
        if(timerVal >= 15)Tweenzor::resetAllTweens();
        timerPosMapped = ofWrap(timerPos, 0, 360);
        
        int thisSec = int(ofGetElapsedTimef()) - timestamp;
        if(thisSec != lastSec) {
            timerVal -= 1;
            lastSec = thisSec;
            if(numFaces>0){
                displayFaceVal += 0.0382*numFaces;
                displayFaceVal = roundf(displayFaceVal * 100) / 100;
                //diplayTotalValue += 0.0382*numFaces;
                //TODO; value to two decimal places even with 0: 5.40
            }
        }
    }
}


//--------------------------------------------------------------
void Display::draw(){
    
    if(displayImage.isAllocated()){
        //float sizeFactor = ofGetWidth()/displayImage.getWidth();
        //displayImage.resize(ofGetWidth(), displayImage.getHeight()*sizeFactor);
        
        displayImage.draw(ofGetWidth()/2 - displayImage.getWidth()/2, 0);
        
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
        
        //headline.setText(displayHeadline);
        //headline.setText("a b c d e f g h i j k l m n o p q r s t u v w x y z 1 2 4 0 2 4 1 - 0 8 3 1 A B C D E F G H I J K L M N O P Q R S T U V");
        //headline.wrapTextX(leftMargin+600);
        //headline.wrapTextArea(750, 300);
        
        //headline.draw(leftMargin, topMargin+700);
        //headline.draw(leftMargin+40, 950);
        //headline.wrapTextArea(750, 300);

        //headline.setColor(255, 255, 255, 255);
        //headline.draw(60, 800);
        
        ofSetColor(255);
        companyFont.drawString(displayCompany + " | "+displayCategory, leftMargin, topMargin+50);
        valueFont.drawString("$"+ofToString(displayFaceVal), valuesRightMargin, topMargin+130);
        eyeLogo.draw(valuesRightMargin, topMargin+170);
        valueFont.drawString(ofToString(numFaces), valuesRightMargin+eyeLogo.getWidth()+40, topMargin+220);
        
        headlineFont.drawString(displayHeadline, leftMargin, topMargin+130);
        
        //labelsFont.drawString("http://attention.market", leftMargin, topMargin-20);
        //labelsFont.drawString("Total Value", valuesLeftMargin+400, topMargin+50);
        //valueFont.drawString(ofToString(diplayTotalValue), valuesLeftMargin+400, topMargin+125);
        //valueFont.drawString("current Social Value: "+displaySocialVal, 50, 80);
        
        ofSetColor(payLightGray);
        ofCircle(timerLoc, timerSize);
        ofPath timerVis = ofPath();
        timerVis.setColor(payRed);
        timerVis.setCircleResolution(100);
        timerVis.arc(timerLoc, timerSize, timerSize, timerPosMapped, 270, false);
        timerVis.draw();
        ofSetColor(payDarkGray);
        ofCircle(timerLoc, timerSize-20);
        ofSetColor(255);
        
        if(timerVal>15)timerVal=15; //lil' hack
        if(timerVal<0)timerVal=0;
        if(timerVal>9)timerFont.drawString(ofToString(timerVal), timerLoc.x-58, timerLoc.y+32);
        else timerFont.drawString(ofToString(timerVal), timerLoc.x-29, timerLoc.y+32);
    } else {
        ofBackground(0, 0, 0);
        ofSetColor(255);
        payLogo.draw(ofGetWidth()/2-(payLogo.getWidth()*1.2f)/2, 0, payLogo.getWidth()*1.2f, payLogo.getHeight()*1.2f);
        ofSetColor(255,255);
        companyFont.drawString("waiting for content to initialize...", ofGetWidth()/2-250, ofGetHeight()/2+450);
    }
}



//--------------------------------------------------------------
void Display::startRound(ofxJSONElement thisContentObj){
    
    thisScreen.init(thisContentObj);
    //    rightScreen.init(thisPair[1]);
    
    cout << ">>>> THIS SCREEN <<<<<\n";
    cout << "objectId:      \t"<<thisContentObj["objectId"].asString();
    cout << "\nimgLocalPath:\t"<< thisScreen.getImgLocalPath();
    cout << "\nheadline:    \t"<< thisScreen.getHeadline();
    cout << "\nface value:  \t"<< thisScreen.getFaceValue();
    cout << "\nsocial value:\t"<< thisScreen.getSocialValue();
    
    displayImage = thisScreen.getImgLocalPath();
    displayFaceVal = thisScreen.getFaceValue();
    displaySocialVal = thisScreen.getSocialValue();
    displayCategory = thisScreen.getCategoryName();
    displayHeadline = thisScreen.getHeadline();
    displayCompany = thisScreen.getCompany();
    diplayTotalValue = thisScreen.getTotalValue(); //float
    displayObjectId = thisContentObj["objectId"].asString();
    shownCount = thisContentObj["shown"].asInt();
    
    float sizeFactor = ofGetWidth()/displayImage.getWidth();
    displayImage.resize(ofGetWidth(), displayImage.getHeight()*sizeFactor);
    
    int lineBreakIdx = 35;
    
    if(displayHeadline.size() > lineBreakIdx){

        int firstLineSpace = displayHeadline.rfind(" ",lineBreakIdx);
        cout<<"firstLineSpace: "<<firstLineSpace<<endl;
        displayHeadline.insert(firstLineSpace, "\n");
        displayHeadline.erase(firstLineSpace+1, 1);
        
        if (displayHeadline.size() > lineBreakIdx*2){
            displayHeadline.insert(lineBreakIdx*2-3, "...");
            displayHeadline = displayHeadline.substr(0, lineBreakIdx*2);
//            int secondLineSpace = displayHeadline.rfind(" ",lineBreakIdx*2);
//            cout<<"secondLineSpace: "<<secondLineSpace<<endl;
//            displayHeadline.insert(secondLineSpace, "\n");
        }
        //split the string
//        if(displayHeadline.compare(27, 1, " ") == 0){
//           displayHeadline.insert(lineBreakIdx, "\n");
//        } else {
//            displayHeadline.insert(lineBreakIdx, "-\n");
//        }
//        if(displayHeadline.size() > 62){
//            displayHeadline.insert(59, "...");
//            displayHeadline = displayHeadline.substr(0, 62);
//        }
    }
    

    
    //cout << "displayHeadline: "<< displayHeadline <<endl;
    
//    headline.setText(displayHeadline);
//    headline.wrapTextArea(750, 300);
//    headline.setLineHeight(0.8);
//    headline.wrapTextForceLines(2);
    
    //Tweenzor::add(&timerPos, 270.f, 630.f, 0.f, 15.f, EASE_IN_OUT_SINE);
    Tweenzor::add(&timerPos, 270.f, 630.f, 0.f, ROUND_TIME, EASE_LINEAR);
    Tweenzor::getTween( &timerPos )->setRepeat( 0, false );
    Tweenzor::addCompleteListener( Tweenzor::getTween(&timerPos), this, &Display::onRoundComplete);
    
    timestamp = int(ofGetElapsedTimef());
    //cout << timestamp << endl;
    lastSec = 0;
    timerVal = 16;
    timerPos = 0.f;
    // _property,  a_begin,  a_end,  a_delay,  a_duration, int a_easeType, float a_p, float a_a) {
    
    roundOn = true;
}


//--------------------------------------------------------------
void Display::onRoundComplete(float* arg) {
    
    roundOn = false;
    
    timerPos = 270;
    timerVal = 0;
    
    string dbName = DATABASE_NAME;
    
    cout << ">>>>> ROUND COMPLETE <<<<<<" << endl;
    cout << "=========================================="<<endl;
    //cout << "Display::onComplete : arg = " << *arg << endl;
    
    //Tweenzor::resetAllTweens();
    Tweenzor::removeTween(&timerPos);
    float faceDiff = displayFaceVal - thisScreen.getFaceValue();
    
    shownCount++;
    string updateObj = "{\"face_val\":"+ofToString(displayFaceVal)+",\"shown\":"+ofToString(shownCount)+"}";
    string updateObj2 = "{\"val_history\":{\"__op\":\"Add\",\"objects\":[{\"face_val\":"+ofToString(faceDiff)+",\"social_val\":0,\"ts\":"+ofToString(ofGetUnixTime())+"000}]}}";

    string completeUpdate = "{\"requests\": [{\"method\": \"PUT\",\"path\": \"/1/classes/"+dbName+"/"+displayObjectId+"\",\"body\": "+ updateObj + "},{\"method\": \"PUT\",\"path\": \"/1/classes/"+dbName+"/"+displayObjectId+"\",\"body\": " + updateObj2 + "}]}";
    
    //string completeUpdate = "{\"requests\": [{\"method\": \"PUT\",\"path\": \"/1/classes/content_dummy_new/"+displayObjectId+"\",\"body\": "+ updateObj + "},{\"method\": \"PUT\",\"path\": \"/1/classes/content_dummy_new/"+displayObjectId+"\",\"body\": " + updateObj2 + "}]}";
    
    ((ofApp*)ofGetAppPtr())->dataConnect.pushData(displayObjectId, completeUpdate);
    
    if(((ofApp*)ofGetAppPtr())->GO_MODE){
        ((ofApp*)ofGetAppPtr())->dataConnect.pullData();
    }
}

//--------------------------------------------------------------
void Display::initFonts(){
    
    ofTrueTypeFont::setGlobalDpi(72);
    
    headline.init("fonts/Lato-Bold.ttf", 72);
    //headline.wrapTextArea(400, 200);
    //headline.setColor(255, 255, 255, 255);
  
    
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