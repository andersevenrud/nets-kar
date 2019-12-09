/**
 * NETS KAR Service module
 *
 * Requirements
 * - p12 license file
 * - license passphrase
 *
 * @author <andersevenrud@gmail.com>
 */
import * as fs from 'fs';
import request from 'request-promise';
import querystring from 'querystring';

/**
 * @typedef karResponse
 * @property {string} code
 * @property {string} message
 * @property {boolean} success
 * @property {string} [newAccountNo=undefined]
 */

/**
 * @typedef karOptions
 * @property {string} cert Path to certificatate (p12)
 * @property {string} passphrase Passphrase for certificate
 * @property {string} mode Service mode
 */

/**
 * Develoment server connection
 * @const {string}
 */
export const KAR_DEVELOPMENT = 'development';

/**
 * Production server connection
 * @const {string}
 */
export const KAR_PRODUCTION = 'production';

/**
 * Server URLs
 * @type {Object.<string,string>}
 */
export const baseUris = {
  [KAR_DEVELOPMENT]: 'https://ajour-test.nets.no',
  [KAR_PRODUCTION]: 'https://ajour.nets.no'
};

/**
 * Ownership response messages
 * @type {Object.<string,string>}
 */
export const ownershipMessages = {
  '01': 'Konto finnes og eies av angitt kunde.',
  '02': 'Konto er omnummerert og ny konto eies av angitt kunde.',
  '03': 'Konto finnes, men eies ikke av angitt kunde.',
  '04': 'Konto finnes ikke.',
  '05': 'Angitt konto er omnummerert, men ny konto finnes ikke.',
  '06': 'Angitt konto er omnummerert. Ny konto finnes, men eies ikke av angitt kunde.',
  '09': 'Ukjent registernummer i angitt konto.',
  '10': 'Angitt konto er ikke CDV-gyldig.',
  '11': 'Angitt kundenummer er ikke gyldig.',
  '13': 'Bankens data er sperret for oppslag fra andre banker.',
  '14': 'Kan ikke verifiseres',
  '15': 'Kan ikke verifiseres'
}

/**
 * Payment response messages
 * @type {Object.<string,string>}
 */
export const paymentMessages = {
  '01': 'Ja, konto finnes',
  '02': 'Ja, men omnummerert',
  '03': 'Nei, konto finnes ikke',
  '04': 'Nei, omnummerert tilkonto finnes ikke',
  '05': 'Nei, omnummerert til bank som ikke deltar i KAR',
  '06': 'Oppgitt bank ikke i KAR',
  '07': 'Oppgitt regnr finnes ikke',
  '08': 'Oppgitt konto ikke CDV-gyldig',
  '09': 'Spørrende banks sdgang til å slå opp I KAR er sperret',
  '10': 'Bankens data er sperret for oppslag fra andre banker',
  '99': 'Generell svarmelding som benyttes ved tekniske feil internt i KAR',
}

/**
 * Validate customer number
 * @param {string} customerNo
 * @return {boolean}
 */
export const validateCustomerNo = customerNo =>
  !!String(customerNo).match(/^\d{11}$/);

/**
 * Validate account number
* @param {string} accountNumber
 * @return {boolean}
 */
export const validateAccountNo = accountNo =>
  !!String(accountNo).match(/^\d{11}$/);

/**
 * Parses response from a request
 * @param {object} messages
 * @param {string} response
 * @return {karResponse}
 */
export const parseResponse = (messages, response) => {
  const qs = querystring.parse(response);
  const codes = Object.keys(messages);
  const code = codes.find(c => typeof qs[c] !== 'undefined');
  const success = parseInt(code, 10) < 3;
  const message = messages[code];
  const newAccountNo = qs.newaccount;
  return { code, success, message, newAccountNo };
};

/**
 * Create new KAR service
 * @param {karOptions} options
 * @example
 *   createKar({ certificate: 'cert.p12', passphrase: '' })
 *     .verifyOwner('00000000000', '11111111111')
 *     .then(({ code, success, message}) => console.log(code, success, message))
 *     .catch(error => console.error('Request error', error))
 */
export const createKar = ({ mode, certificate, passphrase }) => {
  const uri = baseUris[mode || KAR_DEVELOPMENT];
  const pfx = fs.readFileSync(certificate);

  const makeRequest = endpoint =>
    request({
      url: `${uri}${endpoint}`,
      method: 'GET',
      agentOptions: { pfx, passphrase }
    })

  /**
   * Request customer account ownership
   * @param {string} customerNo
   * @param {string} accountNumber
   * @return {Promise<karResponse>}
   */
  const verifyOwner = (customerNo, accountNo) => {
    const endpoint = `/kar-direct/customers/${customerNo}/accounts/${accountNo}/karVerifyAccountOwner`;

    if (!validateCustomerNo(customerNo) || !validateAccountNo(accountNo)) {
      return Promise.reject(new Error('Invalid input'));
    }

    return makeRequest(endpoint)
      .then(response => parseResponse(ownershipMessages, response));
  };

  /**
   * Request account validity
   * @param {accountNumber} accountNumber
   * @return {Promise<karResponse>}
   */
  const verifyPayment = (accountNo) => {
    const endpoint = `/kar-direct/accounts/${accountNo}/karVerifyAccountPayment`;

    if (!validateAccountNo(accountNo)) {
      return Promise.reject(new Error('Invalid input'));
    }

    return makeRequest(endpoint)
      .then(response => parseResponse(paymentMessages, response));
  };

  return { verifyOwner, verifyPayment }
};
