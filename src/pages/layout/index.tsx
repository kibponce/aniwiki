import styled from "styled-components";
import { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <StyledLayout>
      <Header />
      <Body>{children}</Body>
      <Footer />
    </StyledLayout>
  );
};

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  min-height: calc(100vh - 225px);
  display: flex;
  flex-direction: column;
`;

export default Layout;
