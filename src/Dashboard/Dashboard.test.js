import DashBoard from "./Dashboard";
import renderer from 'react-test-renderer';
import { fireEvent, getByTestId, render, renderHook, waitFor } from '@testing-library/react'
import { ipcMain, ipcRenderer } from "electron";
import React from "react";
import { channels } from "../shared/constants";

const mElectron = { on: jest.fn(), send: jest.fn(), receive: jest.fn()};

jest.mock(
    'electron',
    () => {
      const mockIpcMain = {
        on: jest.fn(),
      };
      return { ipcMain: mockIpcMain };
    },
    { virtual: true },
  );

describe('Dashboard', () => {

    beforeEach(() => {
        global.window.api = mElectron;
    });

    it('initializes correctly', () =>{
        const component = render(<DashBoard></DashBoard>);
        const text = component.getByTestId('username');
        expect(text.textContent).toBe('default');
    })

    it('receives user info', async () => {
        global.window.api.receive.mockImplementation((channel, func) => {
            func({display_name: 'mock'})
        });
        
        const component = render(<DashBoard></DashBoard>);
        
        expect(global.window.api.send).toBeCalledWith(channels.CALL_API, expect.any(Object));
        expect(global.window.api.receive).toBeCalled();

        const text = component.getByTestId('username');
        expect(text.textContent).toBe('mock');
    })

    afterEach(() => {
        jest.clearAllMocks();
    })
})