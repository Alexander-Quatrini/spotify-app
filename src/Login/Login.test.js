import Login from "./Login";
import renderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react'
import React from "react";
import { channels } from "../shared/constants";

const mElectron = { on: jest.fn(), send: jest.fn(), receive: jest.fn()};

describe('Login', () => {

    beforeEach(() =>{
        global.window.api = mElectron;
    })
    
    it('works', () =>{
        expect.assertions(1);
        const component = renderer.create(<Login></Login>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });


    it('receives data',  () => {
        
        global.window.api.receive.mockImplementationOnce((channel, callback) => {
            callback('{}');
        })

        const spy = jest.spyOn(console, 'log')

        expect.assertions(2);
        const component = render(<Login/>)
        const button =  component.getByTestId('library-load');

        fireEvent.click(button);

        expect(global.window.api.send).toBeCalledWith(channels.CALL_API, expect.any(Object));
        expect(spy).toBeCalledWith('{}');
    });
})