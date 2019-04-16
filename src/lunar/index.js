
import lunarTable from './lunarTable';



var rmNum = lunarTable[val_yy].intercalation ? lunarTable[val_yy].intercalation : 0;




if (!_self.type && rmNum) {
  if (rmNum == (date_mm - 1)) {
    date_mm = -(date_mm - 1);
  } else if (rmNum < (date_mm - 1)) {
    date_mm = date_mm - 1;
  } else {
    date_mm = date_mm;
  }
}





class Lunar {

}