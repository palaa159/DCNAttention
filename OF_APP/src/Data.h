//
//  Data.h
//  ofApp
//
//  Created by Joseph Saavedra on 1/14/15.
//
//

#pragma once

#include "ofMain.h"
#include "ofxJSON.h"

#define NUM_CATEGORIES 7

class Category {
public:
    vector<ofxJSONElement> objects;
//    void clear(){
//    objects.clear();
//    }
};
//void Category::clear(){
//    objects.clear();
//}


class Data {
    
public:
    Data();
    void update();
    void draw();
    bool pushData(string objectId, string updateObject);
    int pullData();
    bool parseData(ofxJSONElement data);
    void sendShowing(string leftObjId, string rightObjId, string catId);
    void sendFace(string objId, int faceVal);
    
    int downloadCounter;
    
    ofxJSONElement getCategory(int catId);
    
    ofxJSONElement json;
    Category categories[NUM_CATEGORIES];
    
    void urlResponse(ofHttpResponse & response);
    
    
private:

};


