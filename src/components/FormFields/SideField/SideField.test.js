import React from 'react';
import {shallow} from 'enzyme';
import SideField from './SideField'
import {Collapse} from 'reactstrap'
import CollapseButton  from '../CollapseButton/CollapseButton';

const defaultProps = {
    id: 'event-category-header',
}

describe('SideField', () => {
    function getWrapper(props) {
        return shallow(<SideField {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        describe('components', () => {
            describe('Collapse', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const collapse = wrapper.find(Collapse)
                    expect(collapse).toHaveLength(1)
                    expect(collapse.prop('isOpen')).toBe(wrapper.state('isOpen'))
                })
            })
            describe('CollapseButton', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    const collapseButton = wrapper.find(CollapseButton)
                    expect(collapseButton).toHaveLength(1)
                    expect(collapseButton.prop('targetCollapseNameId')).toBe(defaultProps.id)
                    expect(collapseButton.prop('isOpen')).toBe(wrapper.state('isOpen'))
                    expect(collapseButton.prop('toggleHeader')).toBe(instance.toggleHeader)
                })
            })
        })
        describe('methods', () => {
            describe('componentDidMount', () => {
                const elementMock = window.addEventListener = jest.fn();
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                beforeEach(() => {
                    jest.clearAllMocks()
                    instance.componentDidMount()
                });
                test('addEventListener is called', () => {
                    expect(elementMock).toBeCalled()
                    expect(elementMock).toHaveBeenCalledTimes(1)
                })
                test('addEventListener is called with correct args', () => {
                    expect(elementMock).toBeCalledWith('resize', expect.any(Function))
                })
            })
            describe('componentWillUnmount', () => {
                const elementMock = window.removeEventListener = jest.fn();
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                beforeEach(() => {
                    jest.clearAllMocks()
                    instance.componentWillUnmount()
                });
                test('removeEventListener is called', () => {
                    expect(elementMock).toBeCalled()
                    expect(elementMock).toHaveBeenCalledTimes(1)
                })
                test('removeEventListener is called with correct args', () => {
                    expect(elementMock).toBeCalledWith('resize', expect.any(Function))
                })
            })
            describe('toggleHeader', () => {
                test('changes state', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    expect(wrapper.state('isOpen')).toBe(true)
                    instance.toggleHeader()
                    expect(wrapper.state('isOpen')).toBe(false)
                })
            })
        })
    })
})
