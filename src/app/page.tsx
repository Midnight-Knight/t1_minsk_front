import Style from "./page.module.scss";
import Title from "@/components/title";

export default function Home() {
  return (
    <div className={Style.Page}>
      <div className={Style.DivColumn}>
        <h2 className={Style.Heading}>RealityFirst<span>Кейс: Smart Support - поддержка нового поколения</span></h2>
          <div className={Style.DivColumnMin}>
              <Title title={'Команда:'} color={'white'}/>
              <ul className={Style.List}>
                  <li>Легоньков Роман - AI/ML и Team Lead</li>
                  <li>Шерри Георгий - AI/ML</li>
                  <li>Парфёнов Егор - Backend</li>
                  <li>Деев Леонид - Frontend</li>
              </ul>
          </div>
      </div>
    </div>
  );
}
