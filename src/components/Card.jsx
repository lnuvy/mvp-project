import React from "react";
import styled from "styled-components";

const Card = (props) => {
  const { children, cg, width, gtc, textAlign, padding, key, border, onClick } =
    props;

  const styles = {
    gtc,
    textAlign,
    cg,
    width,
    padding,
    key,
    border,
    onClick,
  };

  return (
    <CardStyle key={key} {...styles}>
      {children}
    </CardStyle>
  );
};

Card.defaultProps = {
  padding: "0",
  border: "none",
  onClick: () => {},
};

const CardStyle = styled.div`
  width: 100%;
  height: fit-content;
  border-radius: 16px;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;

export default Card;
