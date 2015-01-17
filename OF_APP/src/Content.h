//
//  Content.h
//  ofApp
//
//  Created by Joseph Saavedra on 1/4/15.
//
//

#pragma once

#include "ofMain.h"
#include "ofxJSON.h"

class Content {
    
public:
    Content();

    void update(float faceVal);
    
    void init(ofxJSONElement object);
    
    string getFaceValue();
    string getSocialValue();
    string getHeadline();
    string getImgLocalPath();
    string getCategoryName();
    string getCompany();
    float getTotalValue();
    
    
    ofxJSONElement thisObject;

    
    ofHttpRequest req;
};