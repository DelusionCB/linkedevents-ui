import constants from '../constants'
import {map, sortBy, omit, get as getIfExists} from 'lodash'
import updater from 'immutability-helper';

import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping.js'
import getContentLanguages from 'src/utils/language'

import {doValidations} from 'src/validation/validator.js'
import {deleteUnselectedLangKeys} from '../utils/helpers';

let editorValues = {
    sub_events: {},
}
let languages = []
let keywordSets = {}
let paymentMethods = {}
let sideFields = {}
try {
    // Local storage form value loading and saving disabled for now
    // editorValues = JSON.parse(localStorage.getItem('EDITOR_VALUES'))
    keywordSets = JSON.parse(localStorage.getItem('KEYWORDSETS'))
    languages = JSON.parse(localStorage.getItem('LANGUAGES'))
    paymentMethods = JSON.parse(localStorage.getItem('PAYMENTMETHODS'))
    sideFields = JSON.parse(localStorage.getItem('SIDEFIELDS'))
    //
} catch(e) {
    editorValues = {}
}

const initialState = {
    values: editorValues || {},
    languages: languages || [],
    contentLanguages: ['fi'],
    keywordSets: keywordSets,
    paymentMethods: paymentMethods,
    sideFields: sideFields,
    validationErrors: {},
    validateFor: null,
    loading: false,
}

/**
 * If validationErrors exist, check if they're fixed
 * @param {object} values
 * @param {object} state
 * @returns {object} validationErrors
 */
function validateValues(values, state) {
    let validationErrors = Object.assign({}, state.validationErrors)
    if (_.keys(state.validationErrors).length > 0) {
        validationErrors = doValidations(values.values, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
    }
    return validationErrors
}

function clearEventDataFromLocalStorage() {
    localStorage.setItem('EDITOR_VALUES', JSON.stringify({}))
}

function update(state = initialState, action) {
    if (action.type === constants.EDITOR_SETDATA) {
        let newValues = {}
        // Merge new values to existing values
        if (action.event) {
            newValues = updater(state, {
                values: {
                    sub_events: {
                        [action.key]: {
                            $set: action.values[action.key],
                        },
                    },
                },
            });
            newValues = newValues.values
        } else if (action.offer) {
            newValues = updater(state, {
                values: {
                    offers: {
                        [action.key]: {
                            $merge: action.values[action.key],
                        },
                    },
                },
            });
            newValues = newValues.values
        } else if (action.video) {
            newValues = updater(state, {
                values: {
                    videos: {
                        [action.key]: {
                            $merge: action.values[action.key],
                        },
                    },
                },
            });
            newValues = newValues.values
        } else {
            newValues = Object.assign({}, state.values, action.values)
        }

        // Local storage saving disabled for now
        // localStorage.setItem('EDITOR_VALUES', JSON.stringify(newValues))

        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors, check if they are fixed
        if (_.keys(state.validationErrors).length > 0) {
            validationErrors = doValidations(newValues, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        if (action.event) {
            return updater(state, {
                values: {
                    sub_events: {
                        [action.key]: {
                            $set: newValues.sub_events[action.key],
                        },
                    },
                },
                validationErrors: {$set: validationErrors},
            });
        } else if (action.offer) {
            return updater(state, {
                values: {
                    offers: {
                        [action.key]: {
                            $set: newValues.offers[action.key],
                        },
                    },
                },
                validationErrors: {$set: validationErrors},
            });
        } else if (action.video) {
            return updater(state, {
                values: {
                    videos: {
                        [action.key]: {
                            $set: newValues.videos[action.key],
                        },
                    },
                },
                validationErrors: {$set: validationErrors},
            });
        }
        return Object.assign({}, state, {
            values: newValues,
            validationErrors: validationErrors,
        })
    }

    if (action.type === constants.EDITOR_SETMETHODDATA) {
        const newValues = updater(state.values, {
            offers: {
                [action.key]: {
                    $merge: action.values,
                },
            },
        })
        return Object.assign({}, state, {
            values: newValues,
        })
    }

    if (action.type === constants.EDITOR_CLEAR_VALUE) {
        const newValues = updater(state, {
            values: {
                $unset: action.values,
            },
        });

        let validationErrors = {}
        if (_.keys(state.validationErrors).length > 0) {
            validationErrors = doValidations(newValues, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }
        return updater(newValues, {
            validationErrors: {
                $set: validationErrors,
            },
        })
    }

    if (action.type === constants.EDITOR_UPDATE_SUB_EVENT) {

        const newValues = updater(state.values, {
            sub_events: {
                [action.eventKey]: {
                    [action.property]: {$set: action.value},
                },
            },
        })

        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors in sub_events, check if they are fixed
        if (state.validationErrors.sub_events) {
            validationErrors = doValidations(newValues, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        const x = Object.assign({}, state, {
            values: newValues,
            validationErrors,
        })
        return x
    }

    if (action.type === constants.EDITOR_DELETE_SUB_EVENT) {
        const oldSubEvents = Object.assign({}, state.values.sub_events);
        const newSubEvents = omit(oldSubEvents, action.event);
        return updater(state, {
            values: {
                sub_events: {
                    $set: newSubEvents,
                },
            },
        });
    }

    if (action.type === constants.EDITOR_SORT_SUB_EVENTS) {
        const mappedSubEvents = map(state.values.sub_events)
        const eventsWithValues = mappedSubEvents.reduce((events, event) => {
            if (event.start_time !== undefined) {
                events.push(event)
            }
            return events
        }, [])
        const sortedSubEvents = sortBy(eventsWithValues, (event) => event.start_time)

        const subEventsObject = {};
        for (const event in sortedSubEvents) {
            subEventsObject[event] = sortedSubEvents[event]
        }

        return updater(state, {
            values: {
                sub_events: {
                    $set: subEventsObject,
                },
            },
        });
    }

    if (action.type === constants.EDITOR_ADD_OFFER) {
        let offersItems = []
        if (state.values.offers) {
            offersItems = JSON.parse(JSON.stringify(state.values.offers))
        }
        offersItems.push(action.values)
        const newValues = updater(state, {
            values: {
                offers: {
                    $set: offersItems,
                },
            },
        })
        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_DELETE_OFFER) {
        const index = parseInt(action.offerKey)
        const offers = JSON.parse(JSON.stringify(state.values.offers))
        offers.splice(index, 1)
        /**
         * If offers.length is falsy(zero in this case) -> last offer was deleted -> unset offers,
         * otherwise set updated offers.
         */
        const updateValues = offers.length ? {offers: {$set: offers}} : {$unset: ['offers']};

        const newValues = updater(state, {
            values: {
                ...updateValues,
            },
        });
        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_ADD_VIDEO) {
        let videoItems = []
        if (state.values.videos) {
            videoItems = JSON.parse(JSON.stringify(state.values.videos))
        }
        videoItems.push(action.values)
        const newValues = updater(state, {
            values: {
                videos: {
                    $set: videoItems,
                },
            },
        })
        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_DELETE_VIDEO) {
        const index = parseInt(action.videoKey)
        const videos = JSON.parse(JSON.stringify(state.values.videos))
        videos.splice(index, 1)
        /**
         * If videos.length is falsy(zero in this case) -> last video was deleted -> unset videos,
         * otherwise set updated videos.
         */
        const updateValues = videos.length ? {videos: {$set: videos}} : {$unset: ['videos']};

        const newValues = updater(state, {
            values: {
                ...updateValues,
            },
        });

        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_SET_NO_VIDEOS) {
        // Content doesn't have videos so we unset it
        // this prevents validation errors on possibly already entered video fields
        const newValues = updater(state, {
            values: {
                $unset: ['videos'],
            },
        })
        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_SET_FREE_OFFERS) {
        // Event is free so we can clear the offers key from state store
        // this prevents validation errors on possibly already entered offer fields
        const newValues = updater(state, {
            values: {
                $unset: ['offers'],
            },
        })
        return Object.assign({}, state, {
            values: newValues.values,
            validationErrors: validateValues(newValues, state),
        })
    }

    if (action.type === constants.EDITOR_SETLANGUAGES) {
        const currentLanguages = state.contentLanguages
        // contains languages are no longer selected.
        const unselectedLanguages = currentLanguages.filter((lang) => !action.languages.includes(lang))
        const updatedState = {contentLanguages: {$set: action.languages}};
        if (unselectedLanguages.length) {
            // delete unselected language fields from values & set to state
            const newValues = deleteUnselectedLangKeys(state.values, unselectedLanguages);
            updatedState.values = {
                $set: newValues,
            };
        }
        return updater(state, {
            ...updatedState,
        });
    }

    if (action.type === constants.VALIDATE_FOR) {
        return Object.assign({}, state, {
            validateFor: action.validateFor,
        })
    }

    if (action.type === constants.EDITOR_REPLACEDATA) {

        // Replace new values to existing values
        let newValues = Object.assign({}, action.values)

        // Local storage saving disabled for now
        // localStorage.setItem('EDITOR_VALUES', JSON.stringify(newValues))

        return Object.assign({}, state, {
            values: newValues,
            contentLanguages: getContentLanguages(newValues),
        })
    }

    if (action.type === constants.EDITOR_CLEARDATA) {
        clearEventDataFromLocalStorage()

        return Object.assign({}, state, {
            values: editorValues,
            validationErrors: {},
            validateFor: null,
            validationStatus: constants.VALIDATION_STATUS.CLEARED,
        })
    }

    if (action.type === constants.EDITOR_SENDDATA_SUCCESS) {
        clearEventDataFromLocalStorage()

        return {
            ...state,
            values: editorValues,
        }
    }

    if (action.type === constants.EDITOR_RECEIVE_KEYWORDSETS) {
        return Object.assign({}, state, {
            keywordSets: action.keywordSets,
        })
    }

    if (action.type === constants.EDITOR_RECEIVE_PAYMENTMETHODS) {
        return Object.assign({}, state, {
            paymentMethods: action.paymentMethods,
        })
    }

    if (action.type === constants.EDITOR_RECEIVE_LANGUAGES) {
        return Object.assign({}, state, {
            languages: action.languages,
        })
    }

    if (action.type === constants.EDITOR_RECEIVE_SIDEFIELDS) {
        return Object.assign({}, state, {
            sideFields: action.sidefields,
        })
    }

    if (action.type === constants.RECEIVE_EVENT_FOR_EDITING) {
        return {
            ...state,
            values: mapAPIDataToUIFormat({...action.event}),
        }
    }

    if (action.type === constants.SELECT_IMAGE_BY_ID) {
        let newVal = getIfExists(action, 'img', null)
        // Merge new values to existing values
        let newImage = (Object.assign({}, state.values, {image: newVal}))
        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors, check if they are fixed
        if (_.keys(state.validationErrors).length > 0) {
            validationErrors = doValidations(newImage, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        const x = Object.assign({}, state, {
            values: newImage,
            validationErrors: validationErrors,
        })
        return x
    }

    if (action.type === constants.SET_VALIDATION_ERRORS) {
        return Object.assign({}, state, {
            validationErrors: action.errors,
            validationStatus: constants.VALIDATION_STATUS.RESOLVE,
        })
    }

    if (action.type === constants.EDITOR_SET_LOADING) {
        return {
            ...state,
            loading: action.loading,
        }
    }

    return state
}

export default update
