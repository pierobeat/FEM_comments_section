interface Button {
  Icon: string,
  label: string,
  color: string,
  hoverColor: string,
  buttonFunc?: () => void,
}

function ReusableButton({Icon, label, color, hoverColor, buttonFunc} : Button) {
  return (
    <div className={`flex gap-2 items-end cursor-pointer ${hoverColor} px-2 select-none border border-transparent rounded-sm`} onClick={buttonFunc}>
      <img src={Icon} alt="" className="h-fit pb-1" />
      <p className={`font-semibold ${color}`}>{label}</p>
    </div>
  )
}

// text-[#5357B6] => color
// hover:bg-[#5356b667] => hoverColor

export default ReusableButton;