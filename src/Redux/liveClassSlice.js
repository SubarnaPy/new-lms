import { createSlice } from "@reduxjs/toolkit";

const liveClassSlice = createSlice({
    name: "liveClass",
    initialState: { activeClass: null, users: [] },
    reducers: {
        startClass: (state, action) => {
            state.activeClass = action.payload;
        },
        addUser: (state, action) => {
            state.users.push(action.payload);
        },
    },
});

export const { startClass, addUser } = liveClassSlice.actions;
export default liveClassSlice.reducer;
