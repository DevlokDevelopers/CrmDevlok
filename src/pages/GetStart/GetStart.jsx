import styles from './GetStart.module.css';

function GetStart(){
    return(
        <div>
            <div  className={styles.body}>

                <div className={styles.container}>
                    <h1>DEVLOK</h1>
                    <p>DEVELOPERS</p>
                </div>

                <a href="/login">
                <button type="submit" className={styles.btn}>Get Started</button>
                </a>

            </div>


        </div>
    )
}
export default GetStart