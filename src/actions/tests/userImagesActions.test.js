import {
    selectImage,
    receiveUserImagesAndMeta,
    receiveDefaultImagesAndMeta,
    imageUploadFailed,
    imageUploadComplete,
    receiveUserImagesFail,
} from '../userImages';
import constants from '../../constants';
import {mockImages} from '../../../__mocks__/mockData';
const {SELECT_IMAGE_BY_ID,
    RECEIVE_IMAGES_AND_META,
    IMAGE_UPLOAD_ERROR,
    IMAGE_UPLOAD_SUCCESS,
    RECEIVE_IMAGES_ERROR,
    RECEIVE_DEFAULT_IMAGES} = constants

/**
 * Returns double nested object with mockImages
 * @returns {{data: {data: [Object]}}}
 */
function dataObjectImages() {
    return {data:{data:[mockImages]}}
}
describe('actions/userImages', () => {
    describe('selectImage', () => {
        test('returns object with correct type and img', () => {
            const data = mockImages[0];
            const expectedResult = {type: SELECT_IMAGE_BY_ID, img: data};
            const result = selectImage(data);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('receiveUserImagesAndMeta', () => {
        test('returns object with correct type & data', () => {
            const mockData = dataObjectImages()
            const expectedResult = {type: RECEIVE_IMAGES_AND_META, items: mockData.data.data};
            const result = receiveUserImagesAndMeta(mockData);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('receiveDefaultImagesAndMeta', () => {
        test('returns object with correct type & data', () => {
            const mockData = dataObjectImages()
            const expectedResult = {type: RECEIVE_DEFAULT_IMAGES, items: mockData.data.data};
            const result = receiveDefaultImagesAndMeta(mockData);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('imageUploadFailed', () => {
        test('returns object with correct type and data', () => {
            const expectedResult = {type: IMAGE_UPLOAD_ERROR, data: 'something went wrong'};
            const result = imageUploadFailed('something went wrong');
            expect(result).toEqual(expectedResult);
        });
    });
    describe('imageUploadComplete', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: IMAGE_UPLOAD_SUCCESS, data: 'everything works'};
            const result = imageUploadComplete('everything works');
            expect(result).toEqual(expectedResult);
        });
    });
    describe('receiveUserImagesFail', () => {
        test('returns object with correct type & empty items', () => {
            const expectedResult = {type: RECEIVE_IMAGES_ERROR, items: []};
            const result = receiveUserImagesFail();
            expect(result).toEqual(expectedResult);
        });
    });
});
