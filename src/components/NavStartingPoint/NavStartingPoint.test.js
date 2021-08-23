import {mount, shallow} from 'enzyme';
import React from 'react'
import {Helmet} from 'react-helmet';

import NavStartingPoint from '.'

describe('NavStartingPoint', () => {
    const defaultProps = {
        location: {pathname: '/home'},
    }

    function getWrapper(props) {
        return shallow(<NavStartingPoint {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        test('title paragraph', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const paragraph = wrapper.find('p')
            expect(paragraph).toHaveLength(1)
            expect(paragraph.prop('aria-hidden')).toBe(instance.state.hideTitleText)
            expect(paragraph.prop('className')).toBe('sr-only')
            expect(paragraph.prop('id')).toBe('page-nav-starting-point')
            expect(paragraph.prop('tabIndex')).toBe(-1)
            expect(paragraph.prop('children')).toBe(instance.state.title)
        })

        test('Helmet', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const helmet = wrapper.find(Helmet)
            expect(helmet).toHaveLength(1)
            expect(helmet.prop('onChangeClientState')).toBe(instance.onHelmetChange)
        })
    })

    describe('functions', () => {
        describe('componentDidUpdate', () => {
            describe('when prop location pathname has changed', () => {
                const location = {pathname: '/about'}

                beforeAll(() => {
                    const div = document.createElement('div')
                    div.setAttribute('id', 'container')
                    document.body.appendChild(div)
                })

                afterAll(() => {
                    const div = document.getElementById('container')
                    if (div) {
                        document.body.removeChild(div)
                    }
                    jest.restoreAllMocks()
                })

                test('sets state hideTitleText to false', () => {
                    jest.spyOn(console, 'warn').mockImplementation(() => {})
                    const instance = mount(
                        <NavStartingPoint {...defaultProps} {...location} />,
                        {attachTo: document.getElementById('container')}).instance()
                    const prevProps = {...defaultProps, location: '/'}
                    instance.componentDidUpdate(prevProps)
                    expect(instance.state.hideTitleText).toBe(false)
                })

                test('title paragraph element found by id calls focus', () => {  
                    const instance = getWrapper({location}).instance()
                    const focus = jest.fn()
                    const mockParagraph = {focus}
                    jest.spyOn(document, 'getElementById').mockImplementation(() => mockParagraph)
                    const prevProps = {...defaultProps, location: '/'}
                    instance.componentDidUpdate(prevProps)
                    expect(focus).toHaveBeenCalledTimes(1)
                })
            })

            describe('when prop location pathname has not changed', () => {
                test('does not set hideTitleText to false', () => {
                    const location = {pathname: '/about'}
                    const instance = getWrapper({location}).instance()
                    const prevProps = {...defaultProps, location}
                    instance.componentDidUpdate(prevProps)
                    expect(instance.state.hideTitleText).toBe(true)
                })
            })
        })

        describe('onHelmetChange', () => {
            test('sets state title to given value', () => {
                const instance = getWrapper().instance()
                const title = 'test page title'
                instance.onHelmetChange({title})
                expect(instance.state.title).toBe(title)
            })
        })
    })
})
