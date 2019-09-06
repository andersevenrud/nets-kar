/**
 * NETS KAR Service module
 * @author <andersevenrud@gmail.com>
 */
const kar = require('./kar');

describe('validateAccountNo', () => {
  it('should validate account numbers', () => {
    expect(kar.validateAccountNo('12345678901')).toBe(true);
    expect(kar.validateAccountNo('1234567890')).toBe(false);
    expect(kar.validateAccountNo(1234567890)).toBe(false);
  });
});

describe('validateCustomerNo', () => {
  it('should validate customer numbers', () => {
    expect(kar.validateCustomerNo('12345678901')).toBe(true);
    expect(kar.validateCustomerNo('1234567890')).toBe(false);
    expect(kar.validateCustomerNo(1234567890)).toBe(false);
  });
});

describe('parseResponse', () => {
  it('should parse karVerifyAccountOwner response', () => {
    expect(kar.parseResponse(
      kar.ownershipMessages,
      '02&Ja&req=karVerifyAccountOwner&customer=11037934560&account=12048831581&newaccount=12077735249'
    )).toMatchObject({
      code: '02',
      success: true,
      newAccountNo: '12077735249'
    });
  });

  it('should parse karVerifyAccountPayment response', () => {
    expect(kar.parseResponse(
      kar.paymentMessages,
      '02&Ja&req=karVerifyAccountPayment&account=account&newaccount=newaccount'
    )).toMatchObject({
      code: '02',
      success: true,
      newAccountNo: 'newaccount'
    });
  });
});
