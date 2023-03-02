import React, { ReactNode } from "react";
import styles from "../css/Button.module.css";

const Lobby = ({ children }: { children: ReactNode }) => {
	return (
		<div className={`${styles.btn}`}>
			<span className={`${styles.noselect}`}>{children}</span>
			<div className={`${styles.circle}`}></div>
		</div>
	);
};

export default Lobby;
