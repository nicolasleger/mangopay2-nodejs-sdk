var _ = require('underscore');
var Promise = require('promise');
var expect = require('chai').expect;
var assert = require('chai').assert;

var helpers = require('../helpers');

var UserLegal = require('../../lib/models/UserLegal');
var UserNatural = require('../../lib/models/UserNatural');
var PersonType = require('../../lib/models/PersonType');
var BankAccount = require('../../lib/models/BankAccount');
var BankAccountDetailsIBAN = require('../../lib/models/BankAccountDetailsIBAN');
var BankAccountDetailsGB = require('../../lib/models/BankAccountDetailsGB');
var KycDocument = require('../../lib/models/KycDocument');
var KycDocumentStatus = require('../../lib/models/KycDocumentStatus');
var KycDocumentType = require('../../lib/models/KycDocumentType');


describe('Users', function() {
    var john = new UserNatural(helpers.data.UserNatural);
    var matrix = new UserLegal(helpers.data.UserLegal);

    before(function(done){
        Promise.all([api.Users.create(john), api.Users.create(matrix)]).then(function() {
            done()
        });
    });

    it('Create Natural', function(){
        expect(john.Id).not.to.be.undefined;
        expect(john.PersonType).to.equal(PersonType.Natural);
    });

    it('Create Legal', function() {
        expect(matrix.Id).not.to.be.undefined;
        expect(matrix.PersonType).to.equal(PersonType.Legal);
    });

    it('Create Legal Fails If Required Properties Not Provided', function(done){
        var user = new UserLegal();
        api.Users.create(user).done(function(){
            assert.fail('Request should not succeed');
        }, function(){
            assert.isOk('Our request failed');
            done();
        });
    });

    describe('Get Natural', function() {
        var john1, john2;
        before(function(done){
            Promise.all([api.Users.get(john.Id), api.Users.getNatural(john.Id)]).then(function(res){
                john1 = res[0];
                john2 = res[1];
                done();
            })
        });

        it('John should be the same', function(){
            expect(_.isMatch(john1, john.data)).to.be.true;
            expect(_.isMatch(john2, john.data)).to.be.true;
        });

        it('Fails for Legal User', function(done) {
            api.Users.getNatural(matrix.Id).done(function(){
                assert.fail('Request passed');
                done()
            }, function(){
                assert.isOk('Should fail');
                done();
            });
        });
    });

    describe('Get Legal', function(){
        var matrix1, matrix2;
        before(function(done){
            Promise.all([api.Users.get(matrix.Id), api.Users.getLegal(matrix.Id)]).then(function(res){
                matrix1 = res[0];
                matrix2 = res[1];
                done();
            })
        });

        it('Matrix should be the same', function(){
            expect(_.isMatch(matrix1, matrix.data)).to.be.true;
            expect(_.isMatch(matrix2, matrix.data)).to.be.true;
        });

        it('Fails for Natural User', function(done) {
            api.Users.getNatural(matrix.Id).done(function(){
                assert.fail('Request passed');
                done()
            }, function(){
                assert.isOk('Should fail');
                done();
            });
        });
    });

    describe('Save Natural', function(){
        var johnClone;
        before(function(done){
            john.LastName += ' - CHANGED';
            api.Users.update(john).then(function(){
                api.Users.get(john.Id).then(function(user){
                    johnClone = user;
                    done();
                });
            });
        });

        it('Models should be the same', function(){
            expect(_.isMatch(john, johnClone)).to.be.true;
        });
    });
    describe('Save Legal', function(){
        var matrixClone;
        before(function(done){
            matrix.LastName += ' - CHANGED';
            api.Users.update(matrix).then(function(){
                api.Users.get(matrix.Id).then(function(user){
                    matrixClone = user;
                    done();
                });
            });
        });

        it('Models should be the same', function(){
            expect(_.isMatch(matrix, matrixClone)).to.be.true;
        });
    });

    describe('Create Bank Account', function(){
        describe('IBAN', function() {
            var ibanAccount;
            before(function(done){
                var account = new BankAccount({
                    OwnerName: john.FirstName + ' ' + john.LastName,
                    OwnerAddress: john.Address,
                    Details: new BankAccountDetailsIBAN({
                        IBAN: 'FR7618829754160173622224154',
                        BIC: 'CMBRFR2BCME'
                    })
                });
                api.Users.createBankAccount(john.Id, account).then(function(account){
                    ibanAccount = account;
                    done();
                });
            });

            it('Account should be created correctly', function(){
                expect(ibanAccount.Id).to.not.be.undefined;
                expect(ibanAccount.UserId).to.equal(john.Id);
            });
        });

        describe('GB', function() {
            var gbAccount;
            before(function(done){
                var account = new BankAccount({
                    OwnerName: john.FirstName + ' ' + john.LastName,
                    OwnerAddress: john.Address,
                    Details: new BankAccountDetailsGB({
                        AccountNumber: '63956474',
                        SortCode: '200000'
                    })
                });
                api.Users.createBankAccount(john.Id, account).then(function(account){
                    gbAccount = account;
                    done();
                });
            });

            it('Account should be created correctly', function(){
                expect(gbAccount.Id).to.not.be.undefined;
                expect(gbAccount.UserId).to.equal(john.Id);
                expect(gbAccount.Type).to.equal('GB');
            });
        });

        describe('US', function() {
            var usAccount;
            before(function(done){
                var account = new BankAccount({
                    OwnerName: john.FirstName + ' ' + john.LastName,
                    OwnerAddress: john.Address,
                    Type: 'US',
                    AccountNumber: '234234234234',
                    ABA: '234334789'
                });
                api.Users.createBankAccount(john.Id, account).then(function(account){
                    usAccount = account;
                    done();
                });
            });

            it('Account should be created correctly', function(){
                expect(usAccount.Id).to.not.be.undefined;
                expect(usAccount.UserId).to.equal(john.Id);
                expect(usAccount.Type).to.equal('US');
            });
        });

        describe('CA', function() {
            var caAccount;
            before(function(done){
                var account = new BankAccount({
                    OwnerName: john.FirstName + ' ' + john.LastName,
                    OwnerAddress: john.Address,
                    Type: 'CA',
                    BankName: 'TestBankName',
                    BranchCode: '12345',
                    AccountNumber: '234234234234',
                    InstitutionNumber: '123'
                });
                api.Users.createBankAccount(john.Id, account).then(function(account){
                    caAccount = account;
                    done();
                });
            });

            it('Account should be created correctly', function(){
                expect(caAccount.Id).to.not.be.undefined;
                expect(caAccount.UserId).to.equal(john.Id);
                expect(caAccount.Type).to.equal('CA');
            });
        });

        describe('OTHER', function() {
            var otherAccount;
            before(function(done){
                var account = new BankAccount({
                    OwnerName: john.FirstName + ' ' + john.LastName,
                    OwnerAddress: john.Address,
                    Type: 'OTHER',
                    Country: 'FR',
                    AccountNumber: '234234234234',
                    BIC: 'BINAADADXXX'
                });
                api.Users.createBankAccount(john.Id, account).then(function(account){
                    otherAccount = account;
                    done();
                });
            });

            it('Account should be created correctly', function(){
                expect(otherAccount.Id).to.not.be.undefined;
                expect(otherAccount.UserId).to.equal(john.Id);
                expect(otherAccount.Type).to.equal('OTHER');
            });
        });
    });

    describe('Bank Accounts', function() {
        var bankAccounts;
        before(function(done){
            api.Users.getBankAccounts(john.Id).then(function(list){
                bankAccounts = list;
                done();
            });
        });

        it('List should contain instances of BankAccount', function(){
            expect(bankAccounts[0] instanceof BankAccount).to.be.true;
            expect(bankAccounts[0].UserId).to.equal(john.Id);
        });

        describe('Sort by creation date', function() {
            var bankAccounts;
            before(function(done){
                api.Users.getBankAccounts(john.Id, {
                    parameters: {
                        Sort: 'CreationDate:desc'
                    }
                }).then(function(list){
                    bankAccounts = list;
                    done();
                });
            });

            it('Should work properly', function(){
                expect(bankAccounts[0].CreationDate).to.be.above(bankAccounts[1].CreationDate);
            });
        });
    });

    describe('Create KYC Document', function() {
        var kycDocument;

        before(function(done){
            api.Users.createKycDocument(john.Id, {
                Status: KycDocumentStatus.Created,
                Type: KycDocumentType.IdentityProof
            }).then(function(document){
                kycDocument = document;
                done();
            });
        });

        it('Should be created correctly', function(){
            expect(kycDocument.Id).not.to.be.undefined;
            expect(kycDocument.Status).to.equal(KycDocumentStatus.Created);
            expect(kycDocument.Type).to.equal(KycDocumentType.IdentityProof);
        });

        describe('Get KYC Document', function() {
            var getKycDocument;
            before(function(done){
                api.Users.getKycDocument(john.Id, kycDocument.Id).then(function(document){
                    getKycDocument = document;
                    done();
                });
            });

            it('Should be retrieved correctly', function(){
                expect(_.isMatch(kycDocument, getKycDocument)).to.be.true;
            });
        });

        describe('Update KYC Document', function() {
            var updatedKycDocument;
            before(function(done){
                kycDocument.Status = KycDocumentStatus.ValidationAsked;
                api.Users.updateKycDocument(john.Id, kycDocument).then(function(){
                    api.Users.getKycDocument(john.Id, kycDocument.Id).then(function(document){
                        updatedKycDocument = document;
                        done();
                    });
                });
            });

            it('Should be updated correctly', function(){
                expect(updatedKycDocument.Status).to.equal(KycDocumentStatus.ValidationAsked);
            });
        });
    });

    describe('Get KYC Documents', function() {
        var kycDocuments;
        before(function(done){
            api.Users.getKycDocuments(john.Id).then(function(list){
                kycDocuments = list;
                done();
            });
        });

        it('List should contain instances of BankAccount', function(){
            expect(kycDocuments[0] instanceof KycDocument).to.be.true;
        });

        describe('Sort by creation date', function() {
            var kycDocuments;
            before(function(done){
                // Create a new document
                api.Users.createKycDocument(john.Id, {
                    Status: KycDocumentStatus.Created,
                    Type: KycDocumentType.IdentityProof
                }).then(function(){
                    // Request documents sorted
                    api.Users.getKycDocuments(john.Id, {
                        parameters: {
                            Sort: 'CreationDate:desc'
                        }
                    }).then(function(list){
                        kycDocuments = list;
                        done();
                    });
                });
            });

            it('Should work properly', function(){
                expect(kycDocuments[0].CreationDate).to.be.above(kycDocuments[1].CreationDate);
            });
        });
    });


});