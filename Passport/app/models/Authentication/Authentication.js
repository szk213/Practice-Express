"use strict"

import bcrypt from 'bcryptjs'

export default class Authentication {
    constructor(password) {
        this._user = { "password": "abc"};
        this._password = password;
    }

    verify(cb) {
        bcrypt.compare(_password, this._user.password, (err, isMatch) => {
            if (err) {
                return cb(err);
            }
            cb(null, isMatch);
        });
    }

    // verify(jwt) {
    //     bcrypt.compare(passw, this.password, function (err, isMatch) {
    //         if (err) {
    //             return cb(err);
    //         }
    //         cb(null, isMatch);
    //     });
    // }
}