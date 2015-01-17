//
//  Content.cpp
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#include "Content.h"

Content::Content(){
    
}


//--------------------------------------------------------------
void Content::init(ofxJSONElement object){

    thisObject = object;
    cout << "\n--------- Content::init object ---------\n";
    cout << " - objectId:" << object["objectId"].asString() <<endl;
    cout << " - cat_id:" << object["cat_id"].asString() <<endl;
    cout << " - category:" << object["category"].asString() <<endl;
    cout << " - company:" << object["company"].asString() <<endl;
    cout << " - face_val:" << object["face_val"].asString() <<endl;
    cout << " - social_val:" << object["social_val"].asString() <<endl;
    cout << " - image_url:" << object["image_url"].asString() <<endl;
    cout << " - headline:" << object["headline"].asString() <<endl;
    cout << " - link:" << object["link"].asString() <<endl;
    cout << " - shown: "<< object["shown"].asInt() << endl;
    cout<< "----------------------------------" << endl;
    
    object["shown"] = object["shown"].asInt() + 1;
    
    ofxJSONElement thisCategoryFile = object;
    thisCategoryFile.save("content/cat_"+object["cat_id"].asString()+".json",true);
    //push this into object
}


//--------------------------------------------------------------
void Content::update( float faceVal ){
//    faceValue = faceVal;
//    cout << "content update faceVal: "<<faceVal<<endl;
}


//--------------------------------------------------------------
string Content::getFaceValue(){
    float thisData = thisObject["face_val"].asFloat();
    return ofToString(thisData);
}

//--------------------------------------------------------------
string Content::getSocialValue(){
    float thisData = thisObject["social_val"].asFloat();
    return ofToString(thisData);
}

//--------------------------------------------------------------
string Content::getHeadline(){
    string thisData = thisObject["headline"].asString();
    return thisData;
}

//--------------------------------------------------------------
string Content::getImgLocalPath(){
    string thisData = thisObject["local_path"].asString();
    return thisData;
}

//--------------------------------------------------------------
string Content::getCategoryName(){
    string thisData = thisObject["category"].asString();
    return thisData;
}

//--------------------------------------------------------------
string Content::getCompany(){
    string thisData = thisObject["company"].asString();
    return thisData;
}

//--------------------------------------------------------------
float Content::getTotalValue(){
    float thisData = thisObject["social_val"].asFloat() + thisObject["face_val"].asFloat();
    return thisData;
}




