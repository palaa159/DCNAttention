//
//  Content.cpp
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#include "ContentModel.h"

ContentModel::ContentModel(){
    
}


//--------------------------------------------------------------
void ContentModel::init(ofxJSONElement object){

    thisObject = object;
    cout << "\n--------- ContentModel::init object ---------\n";
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
void ContentModel::update( float faceVal ){
//    faceValue = faceVal;
//    cout << "content update faceVal: "<<faceVal<<endl;
}


//--------------------------------------------------------------
float ContentModel::getFaceValue(){
    float thisData = thisObject["face_val"].asFloat();
    return thisData;
}

//--------------------------------------------------------------
float ContentModel::getSocialValue(){
    float thisData = thisObject["social_val"].asFloat();
    return thisData;
}

//--------------------------------------------------------------
string ContentModel::getHeadline(){
    string thisData = thisObject["headline"].asString();
    return thisData;
}

//--------------------------------------------------------------
string ContentModel::getImgLocalPath(){
    string thisData = thisObject["local_path"].asString();
    return thisData;
}

//--------------------------------------------------------------
string ContentModel::getCategoryName(){
    string thisData = thisObject["category"].asString();
    return thisData;
}

//--------------------------------------------------------------
string ContentModel::getCompany(){
    string thisData = thisObject["company"].asString();
    return thisData;
}

//--------------------------------------------------------------
float ContentModel::getTotalValue(){
    float thisData = thisObject["social_val"].asFloat() + thisObject["face_val"].asFloat();
    return thisData;
}




