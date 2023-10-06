"use client"
import { RecoilRoot } from "recoil";

function MyApp({ children  }:any) : any {
  return (
    <RecoilRoot>
      {children}
    </RecoilRoot>
  );
}

export default MyApp;